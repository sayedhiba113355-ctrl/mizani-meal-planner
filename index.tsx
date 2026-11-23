import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, ArrowLeft, Baby, Briefcase, Dumbbell, HeartPulse, PieChart, RotateCcw, Thermometer, UserRound } from "lucide-react";

import { NumberField, Segmented } from "@/components/app/fields";
import { Panel, PanelTitle } from "@/components/app/status";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { fmt } from "@/lib/format";
import { EFFORT_LEVELS, PHYSIO_STATUS, PRESETS, type Effort, type PhysioStatus } from "@/lib/nutrition";
import { cn } from "@/lib/utils";
import { useEnergy, usePlanStore } from "@/store/plan-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "بيانات الحالة | دليل التغذية العلاجية" },
      { name: "description", content: "أدخل بيانات الحالة أو اختر حالة من المحاضرة لحساب الاحتياج اليومي من السعرات فورًا." },
      { property: "og:title", content: "بيانات الحالة | دليل التغذية العلاجية" },
      { property: "og:description", content: "حالات المحاضرة الجاهزة وإدخال كامل لبيانات المريض لحساب BMR وRDA." },
    ],
  }),
  component: ProfilePage,
});

const PRESET_ICONS = { male33: UserRound, pregnant32: Baby, lactating35: HeartPulse } as const;

function ProfilePage() {
  const profile = usePlanStore((s) => s.profile);
  const activePreset = usePlanStore((s) => s.activePreset);
  const setProfile = usePlanStore((s) => s.setProfile);
  const applyPreset = usePlanStore((s) => s.applyPreset);
  const resetMacros = usePlanStore((s) => s.resetMacros);
  const energy = useEnergy();
  const pctOk = Math.abs(energy.macroPctSum - 100) < 0.01;

  return (
    <div className="space-y-4">
      <section className="bg-hero relative overflow-hidden rounded-3xl p-5 text-primary-foreground shadow-card animate-rise">
        <div className="absolute -start-10 -top-10 size-40 rounded-full bg-primary-glow/30 blur-2xl" />
        <p className="text-xs opacity-80">حالات المحاضرة — بضغطة واحدة</p>
        <h1 className="mt-1 text-2xl font-bold">ابدأ بحالة جاهزة وقارن بالنتيجة</h1>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {PRESETS.map((p) => {
            const Icon = PRESET_ICONS[p.id];
            const active = activePreset === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p.id)}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border p-3 text-start transition-all",
                  active
                    ? "border-accent bg-accent text-accent-foreground shadow-card"
                    : "border-primary-foreground/20 bg-primary-foreground/10 hover:bg-primary-foreground/20",
                )}
              >
                <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", active ? "bg-accent-foreground/10" : "bg-primary-foreground/15")}>
                  <Icon className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{p.title}</span>
                  <span className="block truncate text-[11px] opacity-80">{p.subtitle}</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <Panel>
          <PanelTitle icon={<UserRound />}>البيانات الأساسية</PanelTitle>
          <div className="space-y-3">
            <Segmented
              value={profile.gender}
              onChange={(gender) => setProfile({ gender })}
              options={[{ value: "male", label: "ذكر" }, { value: "female", label: "أنثى" }]}
            />
            <div className="grid grid-cols-3 gap-2">
              <NumberField label="العمر" suffix="سنة" value={profile.age} onChange={(age) => setProfile({ age })} />
              <NumberField label="الطول" suffix="سم" value={profile.height} onChange={(height) => setProfile({ height })} />
              <NumberField label="الوزن المثالي" suffix="كجم" step={0.1} value={profile.idealWeight} onChange={(idealWeight) => setProfile({ idealWeight })} />
            </div>
          </div>
        </Panel>

        <Panel>
          <PanelTitle icon={<Thermometer />}>الحرارة والنشاط</PanelTitle>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <NumberField label="حرارة الجسم" suffix="°م" step={0.1} value={profile.bodyTemp} onChange={(bodyTemp) => setProfile({ bodyTemp })} />
              <NumberField label="حرارة الجو" suffix="°م" value={profile.climateTemp} onChange={(climateTemp) => setProfile({ climateTemp })} />
            </div>
            <label className="flex items-center justify-between rounded-xl border border-input bg-card px-3 py-2.5">
              <span className="flex items-center gap-2 text-sm font-medium">
                <Dumbbell className="size-4 text-primary" />
                يمارس الرياضة
                <span className="text-xs text-muted-foreground">(+6% من BMR المثالي)</span>
              </span>
              <Switch checked={profile.exercise} onCheckedChange={(exercise) => setProfile({ exercise })} />
            </label>
          </div>
        </Panel>

        <Panel>
          <PanelTitle icon={<Briefcase />}>المهنة / المجهود</PanelTitle>
          <div className="grid gap-2">
            {(Object.keys(EFFORT_LEVELS) as Effort[]).map((k) => {
              const e = EFFORT_LEVELS[k];
              const active = profile.effort === k;
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setProfile({ effort: k })}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-xl border p-3 text-start transition-all",
                    active ? "border-primary bg-secondary" : "border-input bg-card hover:bg-muted",
                  )}
                >
                  <span>
                    <span className="block text-sm font-semibold">{e.label}</span>
                    <span className="block text-xs text-muted-foreground">{e.examples}</span>
                  </span>
                  <span className={cn("num rounded-full px-2.5 py-1 text-sm font-bold", active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                    {e.pct}%
                  </span>
                </button>
              );
            })}
          </div>
        </Panel>

        <Panel>
          <PanelTitle icon={<Activity />}>الحالة الفسيولوجية</PanelTitle>
          <Segmented<PhysioStatus>
            value={profile.status}
            onChange={(status) => setProfile({ status })}
            options={(Object.keys(PHYSIO_STATUS) as PhysioStatus[]).map((k) => ({
              value: k,
              label: PHYSIO_STATUS[k].label,
              disabled: profile.gender === "male" && k !== "normal",
            }))}
          />
          <p className="mt-2 text-xs text-muted-foreground">
            الحامل: +300 سعر بعد المجهود • المرضع: +500 سعر بعد المجهود
          </p>

          <div className="mt-4">
            <PanelTitle
              icon={<PieChart />}
              extra={
                <Button variant="soft" size="sm" onClick={resetMacros}>
                  <RotateCcw /> الافتراضي
                </Button>
              }
            >
              توزيع العناصر الكبرى
            </PanelTitle>
            <div className="grid grid-cols-3 gap-2">
              <NumberField label="بروتين" suffix="%" value={profile.proteinPct} onChange={(proteinPct) => setProfile({ proteinPct })} />
              <NumberField label="كربوهيدرات" suffix="%" value={profile.carbsPct} onChange={(carbsPct) => setProfile({ carbsPct })} />
              <NumberField label="دهون" suffix="%" value={profile.fatPct} onChange={(fatPct) => setProfile({ fatPct })} />
            </div>
            <div className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-muted" dir="ltr">
              <div className="bg-protein" style={{ width: `${Math.max(0, profile.proteinPct)}%` }} />
              <div className="bg-carbs" style={{ width: `${Math.max(0, profile.carbsPct)}%` }} />
              <div className="bg-fat" style={{ width: `${Math.max(0, profile.fatPct)}%` }} />
            </div>
            <p className={cn("mt-2 text-xs font-medium", pctOk ? "text-success" : "text-destructive")}>
              المجموع <span className="num">{fmt(energy.macroPctSum)}%</span>
              {pctOk ? " ✓" : " — يجب أن يساوي 100%"}
            </p>
          </div>
        </Panel>
      </div>

      <Link
        to="/calculation"
        className="flex items-center justify-between rounded-2xl bg-primary p-4 text-primary-foreground shadow-card animate-rise"
      >
        <span>
          <span className="block text-xs opacity-80">الاحتياج اليومي (RDA)</span>
          <span className="num font-display text-3xl font-bold">{fmt(energy.rda)}</span>
          <span className="text-sm opacity-80"> سعر</span>
        </span>
        <span className="flex items-center gap-1 text-sm font-semibold">
          خطوات الحساب <ArrowLeft className="size-4" />
        </span>
      </Link>
    </div>
  );
}
