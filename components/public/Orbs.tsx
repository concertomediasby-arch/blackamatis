/** Large blurred background orbs (decorative). */
export function Orbs() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div className="orb right-[-160px] top-[80px] h-[620px] w-[620px] bg-amber opacity-30 blur-[140px]" />
      <div className="orb left-[-200px] top-[760px] h-[640px] w-[640px] bg-navy opacity-90 blur-[120px]" />
      <div className="orb right-[10%] top-[1500px] h-[560px] w-[560px] bg-lemon opacity-[0.16] blur-[150px]" />
      <div className="orb left-[20%] top-[2200px] h-[640px] w-[640px] bg-amber opacity-25 blur-[150px]" />
      <div className="orb right-[-100px] top-[2900px] h-[560px] w-[560px] bg-navy opacity-90 blur-[120px]" />
      <div className="orb left-[-120px] top-[3700px] h-[600px] w-[600px] bg-amber opacity-25 blur-[150px]" />
    </div>
  );
}
