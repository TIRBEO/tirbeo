"use client";

export function SkeletonLine({ width, height = 14, radius = 6, className = "" }: { width?: string | number; height?: number; radius?: number; className?: string }) {
  return (
    <div className={`skeleton ${className}`} style={{ width: width || "100%", height, borderRadius: radius, flexShrink: 0 }} />
  );
}

export function SkeletonCircle({ size = 44, radius }: { size?: number; radius?: number }) {
  return <div className="skeleton" style={{ width: size, height: size, borderRadius: radius ?? size / 2, flexShrink: 0 }} />;
}

export function SkeletonCard({ rows = 3 }: { rows?: number }) {
  return (
    <div className="glass card-section" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <SkeletonLine width="40%" height={14} />
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonLine key={i} width={i === rows - 1 ? "70%" : "100%"} height={12} />
      ))}
    </div>
  );
}

/* ── Page-specific skeletons ── */

export function HomeSkeleton() {
  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div className="flex items-center gap-4">
        <SkeletonCircle size={52} radius={14} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          <SkeletonLine width="140px" height={20} />
          <SkeletonLine width="90px" height={13} />
        </div>
      </div>
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass" style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          <SkeletonLine width="80px" height={11} />
          <SkeletonLine width="60px" height={24} />
        </div>
        <div className="glass" style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          <SkeletonLine width="80px" height={11} />
          <SkeletonLine width="60px" height={24} />
        </div>
      </div>
      {/* Quick actions */}
      <div className="glass" style={{ padding: "22px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
        <SkeletonLine width="120px" height={14} />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-subtle" style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
              <SkeletonCircle size={16} />
              <SkeletonLine width="70%" height={13} />
              <SkeletonLine width="50%" height={11} />
            </div>
          ))}
        </div>
      </div>
      {/* Bottom cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <SkeletonCard rows={5} />
        <SkeletonCard rows={4} />
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-12">
      <div className="section-header">
        <SkeletonLine width="120px" height={22} />
        <SkeletonLine width="200px" height={13} />
      </div>
      <div className="glass card-section">
        <div className="flex items-center gap-4" style={{ marginBottom: 20 }}>
          <SkeletonCircle size={56} radius={14} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <SkeletonLine width="140px" height={14} />
            <SkeletonLine width="180px" height={12} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <SkeletonLine width="70px" height={11} />
              <SkeletonLine height={42} radius={11} />
            </div>
          ))}
        </div>
      </div>
      <div className="glass card-section">
        <SkeletonLine width="80px" height={14} />
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          <SkeletonLine height={80} radius={11} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <SkeletonLine width="70px" height={11} />
                <SkeletonLine height={42} radius={11} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="glass card-section">
        <SkeletonLine width="80px" height={14} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" style={{ marginTop: 16 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <SkeletonLine width="70px" height={11} />
              <SkeletonLine height={42} radius={11} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SecuritySkeleton() {
  return (
    <div className="space-y-8">
      <div className="section-header">
        <SkeletonLine width="120px" height={22} />
        <SkeletonLine width="260px" height={13} />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="glass card-section" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <SkeletonLine width="160px" height={14} />
          <SkeletonLine width="200px" height={13} />
          <SkeletonLine width="100%" height={42} radius={11} />
        </div>
      ))}
    </div>
  );
}

export function NotificationsSkeleton() {
  return (
    <div className="space-y-8">
      <div className="section-header">
        <SkeletonLine width="160px" height={22} />
        <SkeletonLine width="100px" height={13} />
      </div>
      <div className="glass" style={{ padding: "4px 0" }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="table-row" style={{ padding: "12px 18px" }}>
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <SkeletonCircle size={7} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                <SkeletonLine width={i % 2 === 0 ? "60%" : "45%"} height={13} />
                <SkeletonLine width="80%" height={11} />
              </div>
            </div>
            <SkeletonLine width="60px" height={11} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function IntegrationsSkeleton() {
  return (
    <div className="space-y-8">
      <div className="section-header">
        <SkeletonLine width="140px" height={22} />
        <SkeletonLine width="280px" height={13} />
      </div>
      <div className="glass card-section">
        <SkeletonLine width="140px" height={14} />
        <SkeletonLine width="300px" height={13} style={{ marginTop: 12 }} />
        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between" style={{ padding: "16px 20px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.04)" }}>
              <div className="flex items-center gap-4">
                <SkeletonCircle size={44} radius={12} />
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <SkeletonLine width="80px" height={14} />
                  <SkeletonLine width="160px" height={12} />
                </div>
              </div>
              <SkeletonLine width="100px" height={34} radius={11} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PreferencesSkeleton() {
  return (
    <div className="space-y-8">
      <div className="section-header">
        <SkeletonLine width="140px" height={22} />
        <SkeletonLine width="180px" height={13} />
      </div>
      <div className="glass card-section" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <SkeletonLine width="80px" height={14} />
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonLine key={i} height={36} radius={11} width="33%" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <SkeletonLine width="70px" height={11} />
              <SkeletonLine height={42} radius={11} />
            </div>
          ))}
        </div>
      </div>
      <div className="glass card-section" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <SkeletonLine width="120px" height={14} />
        <SkeletonLine height={42} radius={11} />
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between" style={{ padding: "12px 0" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <SkeletonLine width="120px" height={13} />
              <SkeletonLine width="200px" height={11} />
            </div>
            <div className="skeleton" style={{ width: 38, height: 22, borderRadius: 11 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ActivitySkeleton() {
  return (
    <div className="space-y-8">
      <div className="section-header">
        <SkeletonLine width="120px" height={22} />
        <SkeletonLine width="180px" height={13} />
      </div>
      <div className="glass card-section">
        <div className="flex gap-2" style={{ marginBottom: 20 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonLine key={i} height={32} radius={8} width="70px" />
          ))}
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="table-row" style={{ padding: "12px 0" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <SkeletonLine width={i % 2 === 0 ? "180px" : "140px"} height={13} />
              <SkeletonLine width="100px" height={11} />
            </div>
            <SkeletonLine width="50px" height={11} />
          </div>
        ))}
      </div>
    </div>
  );
}
