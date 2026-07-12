import { LogoIcon } from '@/components/ui/icons';

export default function BrandPanel() {
  return (
    <div className="relative hidden w-[42%] flex-col justify-between overflow-hidden bg-gradient-to-br from-accent2 via-accent to-accentdk p-11 px-10 text-white md:flex">
      <div className="absolute -bottom-[90px] -right-[70px] h-60 w-60 rounded-full bg-white/10" />
      <div className="absolute -left-10 -top-[60px] h-[150px] w-[150px] rounded-full bg-white/10" />

      <div className="relative flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-accent">
          <LogoIcon />
        </div>
        <span className="font-display text-[22px] font-bold tracking-tight">RealTalk</span>
      </div>

      <div className="relative">
        <h2 className="mb-3 font-display text-[27px] font-semibold leading-tight">
          Conversations that feel real.
        </h2>
        <p className="text-sm leading-relaxed opacity-90">
          Message the people who matter. Fast, private, and beautifully simple.
        </p>
      </div>

      <div className="relative flex gap-[7px]">
        <span className="h-1.5 w-[26px] rounded-full bg-white" />
        <span className="h-1.5 w-2 rounded-full bg-white/50" />
        <span className="h-1.5 w-2 rounded-full bg-white/50" />
      </div>
    </div>
  );
}
