"use client";

import { FormEvent, useEffect, useId, useState } from "react";
import { toast } from "sonner";
import { ImagePlus, Upload } from "lucide-react";
import {
  useGetLandingQuery,
  useUpdateLandingMutation,
  useUploadLandingImageMutation,
  type ILandingContent,
} from "@/redux/api/landingApi";
import { useGetMyProfileQuery } from "@/redux/api/authApi";
import { apiErrorMessage, isApiSuccess } from "@/lib/apiError";
import SafeImage from "@/components/home/SafeImage";

type TabId = "hero" | "roles" | "product" | "pipeline" | "legal" | "close";

const TABS: { id: TabId; label: string }[] = [
  { id: "hero", label: "Hero" },
  { id: "roles", label: "Roles" },
  { id: "product", label: "Product" },
  { id: "pipeline", label: "Pipeline" },
  { id: "legal", label: "Legal" },
  { id: "close", label: "Close CTA" },
];

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent/40";

function ImageField({
  label,
  url,
  uploading,
  onUrl,
  onFile,
  tall,
}: {
  label: string;
  url: string;
  uploading: boolean;
  onUrl: (url: string) => void;
  onFile: (file: File | undefined) => void;
  tall?: boolean;
}) {
  const inputId = useId();
  const [pickedName, setPickedName] = useState("");

  return (
    <div className="rounded-xl border border-ink/10 bg-mist/40 p-3">
      <p className="text-sm font-medium text-ink">{label}</p>
      <div className="mt-2 grid gap-3 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] sm:items-start">
        <div
          className={`relative overflow-hidden rounded-xl border border-ink/10 bg-ink/5 ${
            tall ? "h-40 md:h-48" : "h-28 md:h-32"
          }`}
        >
          {url ? (
            <SafeImage src={url} alt="" fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center gap-2 text-sm text-muted">
              <ImagePlus size={18} />
              No image yet
            </div>
          )}
        </div>
        <div className="min-w-0 space-y-2">
          <input
            type="url"
            value={url}
            onChange={(e) => onUrl(e.target.value)}
            placeholder="https://res.cloudinary.com/..."
            className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40"
          />
          <input
            id={inputId}
            type="file"
            accept="image/*"
            className="sr-only"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              setPickedName(file?.name || "");
              onFile(file);
            }}
          />
          <label
            htmlFor={inputId}
            className={`inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-ink/20 bg-ink px-4 py-2.5 text-sm font-semibold text-accent transition hover:bg-ink-soft ${
              uploading ? "pointer-events-none opacity-60" : ""
            }`}
          >
            <Upload size={16} />
            {uploading ? "Uploading…" : "Upload image"}
          </label>
          {pickedName ? (
            <p className="truncate text-[11px] text-muted">{pickedName}</p>
          ) : (
            <p className="text-[11px] text-muted">
              PNG, JPG, or WebP → Cloudinary. Then save to publish.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminLandingPage() {
  const { data: profile } = useGetMyProfileQuery(undefined);
  const role = (profile?.data as { role?: string } | undefined)?.role;
  const canEdit = role === "admin" || role === "super_admin";

  const { data, isLoading } = useGetLandingQuery(undefined);
  const [updateLanding, { isLoading: saving }] = useUpdateLandingMutation();
  const [uploadImage, { isLoading: uploading }] =
    useUploadLandingImageMutation();

  const [draft, setDraft] = useState<ILandingContent | null>(null);
  const [tab, setTab] = useState<TabId>("hero");

  useEffect(() => {
    const landing = data?.data as ILandingContent | undefined;
    if (!landing) return;
    const next = structuredClone(landing);
    if (!next.legal.docs?.length) {
      next.legal.docs = [
        {
          slug: "about",
          title: "About us",
          blurb: "",
          coverImage: "",
        },
        {
          slug: "privacy",
          title: "Privacy policy",
          blurb: "",
          coverImage: "",
        },
        {
          slug: "terms",
          title: "Terms & conditions",
          blurb: "",
          coverImage: "",
        },
      ];
    }
    setDraft(next);
  }, [data]);

  if (!canEdit) {
    return (
      <div className="px-4 py-8 text-sm text-muted md:px-6">
        Platform admin access required to edit landing content.
      </div>
    );
  }

  if (isLoading || !draft) {
    return (
      <div className="space-y-3 px-4 py-6 md:px-6">
        <div className="skeleton h-10 w-64 rounded-xl" />
        <div className="skeleton h-48 w-full rounded-2xl" />
      </div>
    );
  }

  const setHero = (key: keyof ILandingContent["hero"], value: string) => {
    setDraft((d) => (d ? { ...d, hero: { ...d.hero, [key]: value } } : d));
  };

  const onUpload = async (
    file: File | undefined,
    apply: (url: string) => void,
  ) => {
    if (!file) return;
    const res = await uploadImage(file);
    if (isApiSuccess(res)) {
      const url = (res.data?.data as { url?: string } | undefined)?.url;
      if (url) {
        apply(url);
        toast.success("Uploaded to Cloudinary — save to publish");
        return;
      }
    }
    toast.error(apiErrorMessage(res, "Upload failed"));
  };

  const onSave = async (e?: FormEvent) => {
    e?.preventDefault();
    const { _id: _omit, ...payload } = draft;
    const res = await updateLanding(payload);
    if (isApiSuccess(res)) toast.success("Landing saved");
    else toast.error(apiErrorMessage(res));
  };

  return (
    <div className="dash-enter flex h-full min-h-0 w-full flex-col">
      <div className="sticky top-0 z-20 border-b border-ink/10 bg-mist/95 px-4 py-4 backdrop-blur md:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
              Platform admin
            </p>
            <h1 className="mt-0.5 font-display text-2xl font-bold text-ink md:text-3xl">
              Landing CMS
            </h1>
            <p className="mt-1 text-sm text-muted">
              Full-width editor for home copy & Cloudinary images.
            </p>
          </div>
          <button
            type="button"
            disabled={saving || uploading}
            onClick={() => void onSave()}
            className="rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-accent disabled:opacity-60"
          >
            {saving ? "Saving…" : uploading ? "Uploading…" : "Save landing"}
          </button>
        </div>

        <div className="mt-4 flex gap-1 overflow-x-auto pb-0.5">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`shrink-0 rounded-lg px-3.5 py-2 text-sm font-semibold transition ${
                tab === t.id
                  ? "bg-ink text-accent"
                  : "bg-white text-ink/70 hover:bg-white hover:text-ink"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <form
        onSubmit={(e) => void onSave(e)}
        className="w-full flex-1 px-4 py-5 md:px-6 md:py-6"
      >
        {tab === "hero" ? (
          <section className="grid w-full gap-5 xl:grid-cols-2">
            <div className="rounded-2xl border border-ink/10 bg-white p-4 md:p-5">
              <h2 className="font-display text-lg font-bold text-ink">Copy</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {(
                  [
                    ["brand", "Brand"],
                    ["headline", "Headline"],
                    ["subhead", "Subhead"],
                    ["primaryCta", "Primary CTA"],
                    ["secondaryCta", "Secondary CTA"],
                  ] as const
                ).map(([key, label]) => (
                  <label
                    key={key}
                    className={`block text-sm font-medium ${
                      key === "subhead" || key === "headline"
                        ? "sm:col-span-2"
                        : ""
                    }`}
                  >
                    {label}
                    {key === "subhead" ? (
                      <textarea
                        value={draft.hero[key]}
                        onChange={(e) => setHero(key, e.target.value)}
                        rows={3}
                        className={fieldClass}
                      />
                    ) : (
                      <input
                        value={draft.hero[key]}
                        onChange={(e) => setHero(key, e.target.value)}
                        className={fieldClass}
                      />
                    )}
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-4 rounded-2xl border border-ink/10 bg-white p-4 md:p-5">
              <h2 className="font-display text-lg font-bold text-ink">Images</h2>
              <ImageField
                label="Banner image"
                url={draft.hero.bannerImage}
                uploading={uploading}
                tall
                onUrl={(url) => setHero("bannerImage", url)}
                onFile={(file) =>
                  void onUpload(file, (url) => setHero("bannerImage", url))
                }
              />
              <ImageField
                label="Accent image"
                url={draft.hero.accentImage || ""}
                uploading={uploading}
                onUrl={(url) => setHero("accentImage", url)}
                onFile={(file) =>
                  void onUpload(file, (url) => setHero("accentImage", url))
                }
              />
            </div>
          </section>
        ) : null}

        {tab === "roles" ? (
          <section className="w-full space-y-5">
            <div className="rounded-2xl border border-ink/10 bg-white p-4 md:p-5">
              <h2 className="font-display text-lg font-bold text-ink">
                Roles section
              </h2>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {(
                  [
                    ["eyebrow", "Eyebrow"],
                    ["title", "Title"],
                    ["subtitle", "Subtitle"],
                  ] as const
                ).map(([key, label]) => (
                  <label
                    key={key}
                    className={`block text-sm font-medium ${
                      key === "subtitle" ? "md:col-span-3" : ""
                    }`}
                  >
                    {label}
                    {key === "subtitle" ? (
                      <textarea
                        value={draft.roles?.[key] || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          setDraft({
                            ...draft,
                            roles: {
                              eyebrow: draft.roles?.eyebrow || "",
                              title: draft.roles?.title || "",
                              subtitle: value,
                              cards: draft.roles?.cards || [],
                            },
                          });
                        }}
                        rows={3}
                        className={fieldClass}
                      />
                    ) : (
                      <input
                        value={draft.roles?.[key] || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          setDraft({
                            ...draft,
                            roles: {
                              eyebrow:
                                key === "eyebrow"
                                  ? value
                                  : draft.roles?.eyebrow || "",
                              title:
                                key === "title"
                                  ? value
                                  : draft.roles?.title || "",
                              subtitle: draft.roles?.subtitle || "",
                              cards: draft.roles?.cards || [],
                            },
                          });
                        }}
                        className={fieldClass}
                      />
                    )}
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              {(draft.roles?.cards || []).map((card, idx) => (
                <div
                  key={card.key || idx}
                  className="rounded-2xl border border-ink/10 bg-white p-4 md:p-5"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                    Card {idx + 1}
                  </p>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <label className="block text-sm font-medium">
                      Eyebrow
                      <input
                        value={card.eyebrow}
                        onChange={(e) => {
                          const cards = [...(draft.roles?.cards || [])];
                          cards[idx] = { ...cards[idx], eyebrow: e.target.value };
                          setDraft({
                            ...draft,
                            roles: {
                              eyebrow: draft.roles?.eyebrow || "",
                              title: draft.roles?.title || "",
                              subtitle: draft.roles?.subtitle || "",
                              cards,
                            },
                          });
                        }}
                        className={fieldClass}
                      />
                    </label>
                    <label className="block text-sm font-medium">
                      Title
                      <input
                        value={card.title}
                        onChange={(e) => {
                          const cards = [...(draft.roles?.cards || [])];
                          cards[idx] = { ...cards[idx], title: e.target.value };
                          setDraft({
                            ...draft,
                            roles: {
                              eyebrow: draft.roles?.eyebrow || "",
                              title: draft.roles?.title || "",
                              subtitle: draft.roles?.subtitle || "",
                              cards,
                            },
                          });
                        }}
                        className={fieldClass}
                      />
                    </label>
                    <label className="block text-sm font-medium md:col-span-2">
                      Summary
                      <textarea
                        value={card.summary}
                        onChange={(e) => {
                          const cards = [...(draft.roles?.cards || [])];
                          cards[idx] = {
                            ...cards[idx],
                            summary: e.target.value,
                          };
                          setDraft({
                            ...draft,
                            roles: {
                              eyebrow: draft.roles?.eyebrow || "",
                              title: draft.roles?.title || "",
                              subtitle: draft.roles?.subtitle || "",
                              cards,
                            },
                          });
                        }}
                        rows={2}
                        className={fieldClass}
                      />
                    </label>
                    <label className="block text-sm font-medium md:col-span-2">
                      Points (one per line)
                      <textarea
                        value={(card.points || []).join("\n")}
                        onChange={(e) => {
                          const cards = [...(draft.roles?.cards || [])];
                          cards[idx] = {
                            ...cards[idx],
                            points: e.target.value
                              .split("\n")
                              .map((p) => p.trim())
                              .filter(Boolean),
                          };
                          setDraft({
                            ...draft,
                            roles: {
                              eyebrow: draft.roles?.eyebrow || "",
                              title: draft.roles?.title || "",
                              subtitle: draft.roles?.subtitle || "",
                              cards,
                            },
                          });
                        }}
                        rows={4}
                        className={fieldClass}
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {tab === "product" ? (
          <section className="w-full space-y-5">
            <div className="rounded-2xl border border-ink/10 bg-white p-4 md:p-5">
              <h2 className="font-display text-lg font-bold text-ink">
                Section header
              </h2>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {(
                  [
                    ["eyebrow", "Eyebrow"],
                    ["title", "Title"],
                    ["subtitle", "Subtitle"],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="block text-sm font-medium">
                    {label}
                    <input
                      value={draft.product[key]}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          product: {
                            ...draft.product,
                            [key]: e.target.value,
                          },
                        })
                      }
                      className={fieldClass}
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="grid w-full gap-4 md:grid-cols-2">
              {draft.product.items.map((item, idx) => (
                <div
                  key={idx}
                  className="space-y-3 rounded-2xl border border-ink/10 bg-white p-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Pillar {idx + 1}
                  </p>
                  <input
                    value={item.title}
                    onChange={(e) => {
                      const items = [...draft.product.items];
                      items[idx] = { ...items[idx], title: e.target.value };
                      setDraft({
                        ...draft,
                        product: { ...draft.product, items },
                      });
                    }}
                    className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm font-semibold"
                    placeholder="Title"
                  />
                  <textarea
                    value={item.body}
                    onChange={(e) => {
                      const items = [...draft.product.items];
                      items[idx] = { ...items[idx], body: e.target.value };
                      setDraft({
                        ...draft,
                        product: { ...draft.product, items },
                      });
                    }}
                    rows={2}
                    className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm"
                    placeholder="Short card blurb"
                  />
                  <textarea
                    value={item.moreInfo || ""}
                    onChange={(e) => {
                      const items = [...draft.product.items];
                      items[idx] = { ...items[idx], moreInfo: e.target.value };
                      setDraft({
                        ...draft,
                        product: { ...draft.product, items },
                      });
                    }}
                    rows={3}
                    className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm"
                    placeholder="More info (modal on click)"
                  />
                  <ImageField
                    label="Pillar image"
                    url={item.image}
                    uploading={uploading}
                    onUrl={(url) => {
                      const items = [...draft.product.items];
                      items[idx] = { ...items[idx], image: url };
                      setDraft({
                        ...draft,
                        product: { ...draft.product, items },
                      });
                    }}
                    onFile={(file) =>
                      void onUpload(file, (url) => {
                        const items = [...draft.product.items];
                        items[idx] = { ...items[idx], image: url };
                        setDraft({
                          ...draft,
                          product: { ...draft.product, items },
                        });
                      })
                    }
                  />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {tab === "pipeline" ? (
          <section className="grid w-full gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
            <div className="space-y-4 rounded-2xl border border-ink/10 bg-white p-4 md:p-5">
              <h2 className="font-display text-lg font-bold text-ink">
                Section + image
              </h2>
              <div className="grid gap-3">
                {(
                  [
                    ["eyebrow", "Eyebrow"],
                    ["title", "Title"],
                    ["subtitle", "Subtitle"],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="block text-sm font-medium">
                    {label}
                    {key === "subtitle" ? (
                      <textarea
                        value={draft.pipeline[key]}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            pipeline: {
                              ...draft.pipeline,
                              [key]: e.target.value,
                            },
                          })
                        }
                        rows={3}
                        className={fieldClass}
                      />
                    ) : (
                      <input
                        value={draft.pipeline[key]}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            pipeline: {
                              ...draft.pipeline,
                              [key]: e.target.value,
                            },
                          })
                        }
                        className={fieldClass}
                      />
                    )}
                  </label>
                ))}
              </div>
              <ImageField
                label="Pipeline image"
                url={draft.pipeline.image || ""}
                uploading={uploading}
                tall
                onUrl={(url) =>
                  setDraft({
                    ...draft,
                    pipeline: { ...draft.pipeline, image: url },
                  })
                }
                onFile={(file) =>
                  void onUpload(file, (url) =>
                    setDraft({
                      ...draft,
                      pipeline: { ...draft.pipeline, image: url },
                    }),
                  )
                }
              />
            </div>

            <div className="rounded-2xl border border-ink/10 bg-white p-4 md:p-5">
              <h2 className="font-display text-lg font-bold text-ink">
                Stages
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {draft.pipeline.stages.map((stage, idx) => (
                  <div
                    key={idx}
                    className="space-y-2 rounded-xl border border-ink/10 bg-mist/30 p-3"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                      Stage {idx + 1}
                    </p>
                    <input
                      value={stage.name}
                      onChange={(e) => {
                        const stages = [...draft.pipeline.stages];
                        stages[idx] = {
                          ...stages[idx],
                          name: e.target.value,
                        };
                        setDraft({
                          ...draft,
                          pipeline: { ...draft.pipeline, stages },
                        });
                      }}
                      className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm font-semibold"
                      placeholder="Stage name"
                    />
                    <textarea
                      value={stage.detail}
                      onChange={(e) => {
                        const stages = [...draft.pipeline.stages];
                        stages[idx] = {
                          ...stages[idx],
                          detail: e.target.value,
                        };
                        setDraft({
                          ...draft,
                          pipeline: { ...draft.pipeline, stages },
                        });
                      }}
                      rows={2}
                      className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm"
                      placeholder="Short card blurb"
                    />
                    <textarea
                      value={stage.moreInfo || ""}
                      onChange={(e) => {
                        const stages = [...draft.pipeline.stages];
                        stages[idx] = {
                          ...stages[idx],
                          moreInfo: e.target.value,
                        };
                        setDraft({
                          ...draft,
                          pipeline: { ...draft.pipeline, stages },
                        });
                      }}
                      rows={3}
                      className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm"
                      placeholder="More info (modal)"
                    />
                    <ImageField
                      label="Stage modal image"
                      url={stage.image || ""}
                      uploading={uploading}
                      onUrl={(url) => {
                        const stages = [...draft.pipeline.stages];
                        stages[idx] = { ...stages[idx], image: url };
                        setDraft({
                          ...draft,
                          pipeline: { ...draft.pipeline, image: draft.pipeline.image, stages },
                        });
                      }}
                      onFile={(file) =>
                        void onUpload(file, (url) => {
                          const stages = [...draft.pipeline.stages];
                          stages[idx] = { ...stages[idx], image: url };
                          setDraft({
                            ...draft,
                            pipeline: { ...draft.pipeline, stages },
                          });
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {tab === "legal" ? (
          <section className="w-full space-y-4 rounded-2xl border border-ink/10 bg-white p-4 md:p-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 className="font-display text-lg font-bold text-ink">
                Legal section copy
              </h2>
              <a
                href="/dashboard/admin/legal"
                className="text-sm font-semibold text-ink underline-offset-2 hover:underline"
              >
                Edit About / Privacy / Terms HTML →
              </a>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {(
                [
                  ["eyebrow", "Eyebrow"],
                  ["title", "Title"],
                  ["subtitle", "Subtitle"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="block text-sm font-medium">
                  {label}
                  {key === "subtitle" ? (
                    <textarea
                      value={draft.legal[key]}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          legal: { ...draft.legal, [key]: e.target.value },
                        })
                      }
                      rows={3}
                      className={fieldClass}
                    />
                  ) : (
                    <input
                      value={draft.legal[key]}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          legal: { ...draft.legal, [key]: e.target.value },
                        })
                      }
                      className={fieldClass}
                    />
                  )}
                </label>
              ))}
            </div>

            <div className="mt-2">
              <h3 className="font-display text-base font-bold text-ink">
                Home legal cards
              </h3>
              <p className="mt-1 text-xs text-muted">
                Card title, blurb, and cover come from here. Full HTML body is
                edited under Legal docs.
              </p>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                {(draft.legal.docs || []).map((doc, idx) => (
                  <div
                    key={doc.slug || idx}
                    className="space-y-2 rounded-xl border border-ink/10 p-3"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                      /legal/{doc.slug}
                    </p>
                    <input
                      value={doc.title}
                      onChange={(e) => {
                        const docs = [...draft.legal.docs];
                        docs[idx] = { ...docs[idx], title: e.target.value };
                        setDraft({
                          ...draft,
                          legal: { ...draft.legal, docs },
                        });
                      }}
                      className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm font-semibold"
                      placeholder="Title"
                    />
                    <textarea
                      value={doc.blurb}
                      onChange={(e) => {
                        const docs = [...draft.legal.docs];
                        docs[idx] = { ...docs[idx], blurb: e.target.value };
                        setDraft({
                          ...draft,
                          legal: { ...draft.legal, docs },
                        });
                      }}
                      rows={2}
                      className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm"
                      placeholder="Blurb"
                    />
                    <ImageField
                      label="Cover image"
                      url={doc.coverImage || ""}
                      uploading={uploading}
                      onUrl={(url) => {
                        const docs = [...draft.legal.docs];
                        docs[idx] = { ...docs[idx], coverImage: url };
                        setDraft({
                          ...draft,
                          legal: { ...draft.legal, docs },
                        });
                      }}
                      onFile={(file) =>
                        void onUpload(file, (url) => {
                          const docs = [...draft.legal.docs];
                          docs[idx] = { ...docs[idx], coverImage: url };
                          setDraft({
                            ...draft,
                            legal: { ...draft.legal, docs },
                          });
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {tab === "close" ? (
          <section className="grid w-full gap-5 xl:grid-cols-2">
            <div className="rounded-2xl border border-ink/10 bg-white p-4 md:p-5">
              <h2 className="font-display text-lg font-bold text-ink">Copy</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {(
                  [
                    ["eyebrow", "Eyebrow"],
                    ["title", "Title"],
                    ["subtitle", "Subtitle"],
                    ["primaryCta", "Primary CTA"],
                    ["secondaryCta", "Secondary CTA"],
                  ] as const
                ).map(([key, label]) => (
                  <label
                    key={key}
                    className={`block text-sm font-medium ${
                      key === "subtitle" || key === "title"
                        ? "sm:col-span-2"
                        : ""
                    }`}
                  >
                    {label}
                    {key === "subtitle" ? (
                      <textarea
                        value={draft.close[key]}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            close: { ...draft.close, [key]: e.target.value },
                          })
                        }
                        rows={3}
                        className={fieldClass}
                      />
                    ) : (
                      <input
                        value={draft.close[key]}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            close: { ...draft.close, [key]: e.target.value },
                          })
                        }
                        className={fieldClass}
                      />
                    )}
                  </label>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-ink/10 bg-white p-4 md:p-5">
              <h2 className="font-display text-lg font-bold text-ink">
                Background
              </h2>
              <div className="mt-4">
                <ImageField
                  label="Background image"
                  url={draft.close.backgroundImage}
                  uploading={uploading}
                  tall
                  onUrl={(url) =>
                    setDraft({
                      ...draft,
                      close: { ...draft.close, backgroundImage: url },
                    })
                  }
                  onFile={(file) =>
                    void onUpload(file, (url) =>
                      setDraft({
                        ...draft,
                        close: { ...draft.close, backgroundImage: url },
                      }),
                    )
                  }
                />
              </div>
            </div>
          </section>
        ) : null}
      </form>
    </div>
  );
}
