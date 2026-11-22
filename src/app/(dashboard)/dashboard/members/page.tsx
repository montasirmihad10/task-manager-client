"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import UseTable from "@/components/ui/UseTable";
import UseModal from "@/components/ui/UseModal";
import {
  useCreateInviteLinkMutation,
  useGetWorkspaceMembersQuery,
  useInviteWorkspaceMemberMutation,
  useInviteWithCredentialsMutation,
  useListInvitesQuery,
  useRemoveMemberMutation,
  useUpdateMemberRoleMutation,
  type IWorkspaceMember,
  type TWorkspaceRole,
} from "@/redux/api/workspaceApi";
import { useOpenDirectChatMutation } from "@/redux/api/chatApi";
import { useGetMyProfileQuery } from "@/redux/api/authApi";
import { useWorkspace } from "@/context/WorkspaceContext";
import { extractList } from "@/lib/taskStats";
import { apiErrorMessage, isApiSuccess } from "@/lib/apiError";
import {
  workspaceKindLabel,
  workspaceRoleLabel,
} from "@/lib/workspaceUi";

type Row = {
  _id: string;
  name: string;
  email: string;
  role: TWorkspaceRole;
  photo?: string;
  membershipId: string;
};

type InviteMode = "link" | "credentials";

function memberUser(m: IWorkspaceMember) {
  return typeof m.userId === "object" && m.userId
    ? m.userId
    : { _id: String(m.userId), email: "—", name: "—" };
}

function memberPhoto(user: {
  profileImage?: string | { url?: string };
}): string | undefined {
  if (typeof user.profileImage === "string") return user.profileImage;
  if (user.profileImage && typeof user.profileImage === "object") {
    return user.profileImage.url;
  }
  return undefined;
}

function displayRole(role: string) {
  return workspaceRoleLabel(role);
}

function MembersPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { workspaceId, workspace, isAdmin, canInvite, role: myRole } =
    useWorkspace();
  const { data: profile } = useGetMyProfileQuery(undefined);
  const myId = (profile?.data as { _id?: string } | undefined)?._id;
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"manager" | "member">("member");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteMode, setInviteMode] = useState<InviteMode>("link");
  const [lastTempPassword, setLastTempPassword] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("invite") === "1" && canInvite) {
      setLastTempPassword(null);
      setInviteOpen(true);
      router.replace("/dashboard/members", { scroll: false });
    }
  }, [searchParams, canInvite, router]);

  const { data: membersResult, isLoading, refetch } =
    useGetWorkspaceMembersQuery(workspaceId || "", { skip: !workspaceId });
  const { data: invitesResult } = useListInvitesQuery(workspaceId || "", {
    skip: !workspaceId || !canInvite,
  });

  const [inviteMember] = useInviteWorkspaceMemberMutation();
  const [createInviteLink] = useCreateInviteLinkMutation();
  const [inviteWithCredentials] = useInviteWithCredentialsMutation();
  const [updateRole] = useUpdateMemberRoleMutation();
  const [removeMember] = useRemoveMemberMutation();
  const [openChat, { isLoading: openingChat }] = useOpenDirectChatMutation();

  const canMessage = (theirRole: TWorkspaceRole, theirId: string) => {
    if (!myId || theirId === myId) return false;
    if (isAdmin) return true;
    if (myRole === "manager" && theirRole === "member") return true;
    if (myRole === "member" && theirRole === "manager") return true;
    if (myRole === "member" && theirRole === "admin") return true;
    return false;
  };

  const startChat = async (recipientId: string) => {
    if (!workspaceId) return;
    const res = await openChat({ workspaceId, recipientId });
    if (isApiSuccess(res)) {
      const id = (res.data?.data as { _id?: string } | undefined)?._id;
      router.push(id ? `/dashboard/messages?c=${id}` : "/dashboard/messages");
    } else {
      toast.error(apiErrorMessage(res, "Could not open chat"));
    }
  };

  const rows: Row[] = useMemo(() => {
    const members = extractList<IWorkspaceMember>(
      membersResult?.data ?? membersResult,
    );
    return members.map((m) => {
      const user = memberUser(m);
      return {
        _id: user._id,
        membershipId: m._id,
        name: user.name || "—",
        email: user.email,
        role: m.role,
        photo: memberPhoto(user),
      };
    });
  }, [membersResult]);

  const invites = extractList<{
    _id: string;
    email: string;
    role: string;
    expiresAt?: string;
  }>(invitesResult?.data ?? invitesResult);

  const onInvite = async (e: FormEvent) => {
    e.preventDefault();
    if (!workspaceId || !email.trim()) return;
    setLastTempPassword(null);

    if (inviteMode === "credentials") {
      const res = await inviteWithCredentials({
        workspaceId,
        email: email.trim(),
        name: name.trim() || undefined,
        role,
      });
      if (isApiSuccess(res)) {
        const data = res.data?.data as
          | { temporaryPassword?: string }
          | undefined;
        setLastTempPassword(data?.temporaryPassword || null);
        toast.success("Credentials emailed (and shown below once)");
        setEmail("");
        setName("");
        refetch();
      } else {
        toast.error(apiErrorMessage(res, "Could not invite with credentials"));
      }
      return;
    }

    const existing = await inviteMember({
      workspaceId,
      email: email.trim(),
      role,
    });

    if (existing?.data?.success || existing?.data?.data) {
      toast.success("Member added (existing account)");
      setEmail("");
      setInviteOpen(false);
      refetch();
      return;
    }

    const linkRes = await createInviteLink({
      workspaceId,
      email: email.trim(),
      role,
    });
    const payload = linkRes?.data?.data as
      | { inviteUrl?: string }
      | undefined;
    if (linkRes?.data?.success || payload?.inviteUrl) {
      toast.success(
        payload?.inviteUrl
          ? `Invite link created: ${payload.inviteUrl}`
          : "Invite sent",
      );
      setEmail("");
      setInviteOpen(false);
    } else {
      toast.error(
        "Could not invite — try “Temporary login” if they don’t have an account yet",
      );
    }
  };

  return (
    <div className="dash-enter px-3 py-4 sm:px-4 sm:py-6 md:px-8 md:py-8">
      <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            {workspace ? workspaceKindLabel(workspace) : "Team"}
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Members
          </h1>
          {workspace ? (
            <p className="mt-1 text-sm text-muted">
              {workspace.name}
              {workspace.isPersonal
                ? " · personal (invite disabled)"
                : ` · your role: ${workspaceRoleLabel(myRole)}`}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="rounded-xl border border-ink/10 bg-paper px-3 py-1.5 text-sm text-muted">
            <span className="font-semibold text-ink">{rows.length}</span> people
          </p>
          {canInvite ? (
            <button
              type="button"
              onClick={() => {
                setLastTempPassword(null);
                setInviteOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-accent"
            >
              <UserPlus size={16} />
              Invite member
            </button>
          ) : null}
        </div>
      </div>

      {!workspaceId ? (
        <p className="text-sm text-muted">Select a workspace first.</p>
      ) : (
        <>
          {canInvite ? (
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-white px-4 py-4">
              <div className="min-w-0">
                <p className="font-display text-base font-semibold text-ink">
                  Add people to this team
                </p>
                <p className="mt-0.5 text-sm text-muted">
                  Send an email invite link, or create a temporary login for
                  someone new.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setLastTempPassword(null);
                  setInviteOpen(true);
                }}
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-accent"
              >
                <UserPlus size={16} />
                Invite member
              </button>
            </div>
          ) : workspace?.isPersonal ? (
            <p className="mb-5 rounded-2xl border border-ink/10 bg-mist px-4 py-3 text-sm text-muted">
              Personal workspaces are solo. Switch to a{" "}
              <span className="font-semibold text-ink">team workspace</span> (or
              create one as a manager) to invite people.
            </p>
          ) : (
            <p className="mb-5 rounded-2xl border border-ink/10 bg-mist px-4 py-3 text-sm text-muted">
              You’re a <span className="font-semibold text-ink">member</span> of
              this team. You can see who’s here and message managers; only
              managers can invite or change roles.
            </p>
          )}

          <UseTable<Row>
            loading={isLoading}
            data={rows}
            emptyText="No members in this workspace"
            columns={[
              {
                key: "profile",
                title: "Profile",
                width: 88,
                render: (row) =>
                  row.photo ? (
                    <Image
                      src={row.photo}
                      alt={row.name}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink font-display text-sm font-bold text-accent">
                      {(row.name || row.email).charAt(0).toUpperCase()}
                    </div>
                  ),
              },
              {
                key: "name",
                title: "Name",
                render: (row) => (
                  <span className="font-medium">{row.name}</span>
                ),
              },
              { key: "email", title: "Email" },
              {
                key: "role",
                title: "Role",
                render: (row) =>
                  isAdmin && row.role !== "admin" ? (
                    <select
                      value={row.role}
                      onChange={async (e) => {
                        await updateRole({
                          workspaceId: workspaceId!,
                          memberId: row.membershipId,
                          role: e.target.value as TWorkspaceRole,
                        });
                        toast.success("Role updated");
                      }}
                      className="rounded-lg border border-ink/15 bg-white px-2 py-1 text-xs font-semibold capitalize"
                    >
                      <option value="manager">manager</option>
                      <option value="member">member</option>
                    </select>
                  ) : (
                    <span className="rounded-md bg-mist px-2 py-0.5 text-xs font-semibold capitalize">
                      {displayRole(row.role)}
                    </span>
                  ),
              },
              {
                key: "actions",
                title: "Actions",
                render: (row) => (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {canMessage(row.role, row._id) ? (
                      <button
                        type="button"
                        disabled={openingChat}
                        onClick={() => void startChat(row._id)}
                        className="rounded-lg bg-ink px-2.5 py-1 text-xs font-semibold text-accent disabled:opacity-60"
                      >
                        Message
                      </button>
                    ) : null}
                    {isAdmin && row.role !== "admin" ? (
                      <button
                        type="button"
                        onClick={async () => {
                          if (!window.confirm("Remove this member?")) return;
                          await removeMember({
                            workspaceId: workspaceId!,
                            memberId: row.membershipId,
                          });
                          toast.success("Member removed");
                        }}
                        className="rounded-lg bg-signal/90 px-2.5 py-1 text-xs font-semibold text-white"
                      >
                        Remove
                      </button>
                    ) : null}
                    {!canMessage(row.role, row._id) &&
                    !(isAdmin && row.role !== "admin") ? (
                      <span className="text-xs text-muted">—</span>
                    ) : null}
                  </div>
                ),
              },
            ]}
          />

          {canInvite && invites.length > 0 ? (
            <div className="mt-6">
              <h2 className="mb-2 font-display text-lg font-semibold text-ink">
                Pending invites
              </h2>
              <ul className="space-y-2">
                {invites.map((inv) => (
                  <li
                    key={inv._id}
                    className="rounded-xl border border-ink/10 bg-white px-4 py-3 text-sm"
                  >
                    <span className="font-medium text-ink">{inv.email}</span>
                    <span className="text-muted"> · {inv.role}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      )}

      <UseModal
        isOpen={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite teammate"
        width="max-w-md"
      >
        <div className="mb-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setInviteMode("link")}
            className={`rounded-xl border px-3 py-2 text-xs font-semibold ${
              inviteMode === "link"
                ? "border-ink bg-ink text-accent"
                : "border-ink/15 text-ink"
            }`}
          >
            Email invite link
          </button>
          <button
            type="button"
            onClick={() => setInviteMode("credentials")}
            className={`rounded-xl border px-3 py-2 text-xs font-semibold ${
              inviteMode === "credentials"
                ? "border-ink bg-ink text-accent"
                : "border-ink/15 text-ink"
            }`}
          >
            Temporary login
          </button>
        </div>

        <p className="mb-3 text-xs text-muted">
          {inviteMode === "link"
            ? "Sends an accept link. If they already have an account, they’re added immediately."
            : "Creates an account with a temporary password (emailed). They must change it on first login."}
        </p>

        <form onSubmit={onInvite} className="space-y-3">
          {inviteMode === "credentials" ? (
            <label className="block text-sm font-medium text-ink">
              Name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Optional"
                className="mt-1.5 w-full rounded-xl border border-ink/15 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent/40"
              />
            </label>
          ) : null}
          <label className="block text-sm font-medium text-ink">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teammate@email.com"
              className="mt-1.5 w-full rounded-xl border border-ink/15 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent/40"
            />
          </label>
          <label className="block text-sm font-medium text-ink">
            Role
            <select
              value={role}
              onChange={(e) =>
                setRole(e.target.value as "manager" | "member")
              }
              className="mt-1.5 w-full rounded-xl border border-ink/15 px-3 py-2.5 text-sm"
            >
              <option value="member">Member</option>
              <option value="manager">Manager</option>
            </select>
          </label>
          <button
            type="submit"
            className="w-full rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-accent"
          >
            {inviteMode === "credentials"
              ? "Create & email login"
              : "Send invite"}
          </button>
        </form>

        {lastTempPassword ? (
          <div className="mt-4 rounded-xl border border-accent/40 bg-accent/15 px-3 py-3 text-sm text-ink">
            <p className="font-semibold">Temporary password (shown once)</p>
            <p className="mt-1 font-mono text-base">{lastTempPassword}</p>
            <p className="mt-1 text-xs text-muted">
              Also sent by email. They’ll set a new password after login.
            </p>
          </div>
        ) : null}
      </UseModal>
    </div>
  );
}

export default function MembersPage() {
  return (
    <Suspense fallback={<div className="px-4 py-6 text-sm text-muted md:px-8">Loading members…</div>}>
      <MembersPageInner />
    </Suspense>
  );
}
