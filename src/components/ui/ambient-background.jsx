/**
 * The two blurred accent shapes behind the auth card. The chat screen reuses
 * them, which is why this lives on its own rather than inside the auth folder.
 */
export default function AmbientBackground() {
  return (
    <>
      <div
        className="pointer-events-none absolute -right-[130px] -top-[170px] z-[1] h-[540px] w-[540px] animate-float bg-gradient-to-br from-accent to-accent2 opacity-90 blur-[1px]"
        style={{ borderRadius: '44% 56% 60% 40% / 48% 44% 56% 52%' }}
      />
      <div
        className="pointer-events-none absolute -bottom-[190px] -left-[150px] z-[1] h-[500px] w-[500px] animate-float-slow bg-gradient-to-br from-accent2 to-accent opacity-50 blur-[1px]"
        style={{ borderRadius: '56% 44% 40% 60% / 52% 56% 44% 48%' }}
      />
    </>
  );
}
