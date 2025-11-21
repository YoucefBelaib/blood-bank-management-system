import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const navigationItems = [
  { label: "Home", active: true },
  { label: "Donate Blood", active: false },
  { label: "Request Blood", active: false },
  { label: "About Us", active: false },
];

export const Desktop = (): JSX.Element => {
  return (
    <div className="bg-[#ffedee] w-full min-h-screen relative overflow-hidden">
      <header className="bg-white w-full h-[116px] flex items-center justify-between px-[38px] relative">
        <img
          className="w-[390px] h-[85px] object-cover"
          alt="Vita Logo"
          src="/figmaAssets/rectangle-12.png"
        />

        <nav className="flex items-center gap-[49px]">
          {navigationItems.map((item, index) => (
            <div key={index} className="relative">
              <button className="[font-family:'Manrope',Helvetica] font-normal text-[#020047] text-[28px] tracking-[0] leading-[normal] whitespace-nowrap hover:opacity-80 transition-opacity">
                {item.label}
              </button>
              {item.active && (
                <img
                  className="absolute top-[48px] left-1/2 -translate-x-1/2 w-[101px] h-[5px]"
                  alt="Active indicator"
                  src="/figmaAssets/line-1.svg"
                />
              )}
            </div>
          ))}
        </nav>
      </header>

      <main className="relative flex items-center justify-between px-14 pt-[166px] pb-[135px]">
        <section className="flex flex-col gap-[118px] max-w-[649px] z-10">
          <div className="flex flex-col gap-[112px]">
            <h1 className="[-webkit-text-stroke:1px_#be1e2b] [font-family:'Manrope',Helvetica] font-normal text-[#be1e2b] text-[64px] text-center tracking-[0] leading-[normal]">
              &quot;Donate Blood, Save Lives...&quot;
            </h1>

            <p className="[font-family:'Manrope',Helvetica] font-normal text-[#02004780] text-[40px] tracking-[0] leading-[normal]">
              Your blood can save someone&apos;s life today, join our mission
              and be a hero.
            </p>
          </div>
        </section>

        <div className="relative">
          <img
            className="w-[663px] h-[702px] rounded-[25px]"
            alt="Blood donation"
            src="/figmaAssets/rectangle-1.png"
          />

          <Card className="absolute bottom-[-95px] left-[-81px] w-[413px] h-[151px] bg-white rounded-[25px] shadow-lg border-0">
            <CardContent className="flex items-center gap-[19px] p-0 h-full">
              <div className="ml-[22px] w-[79px] h-[77px] bg-[#ffedef] rounded-[39.5px] flex-shrink-0" />

              <div className="flex flex-col gap-[9px]">
                <span className="[font-family:'Manrope',Helvetica] font-normal text-[#02004780] text-2xl tracking-[0] leading-[normal]">
                  This Month
                </span>
                <span className="[font-family:'Manrope',Helvetica] font-normal text-[#020047] text-[40px] tracking-[0] leading-[normal] whitespace-nowrap">
                  +80 Donations
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};
