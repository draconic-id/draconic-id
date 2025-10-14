import {
  CreditCard,
  CreditCardBack,
  CreditCardFlipper,
  CreditCardFront,
  CreditCardNumber,
} from '@/components/ui/credit-card';
import type { HTMLAttributes } from 'react';

import { Flame, Brain, Plane, ScanLine, Star, Nfc } from "lucide-react";
import React from "react";
import Image from 'next/image';
import Link from 'next/link';
import { AnimatedSpan, Terminal, TypingAnimation } from '@/components/ui/terminal';
import LandingMap from '@/components/landing-map';
import { auth } from '@/lib/auth';

import ResponsiveScale from "@/components/responsive-scale";
import { headers } from 'next/headers';

export default async function Page() {
      const session = await auth.api.getSession({
          headers: await headers() // you need to pass the headers object.
      })
  return (
    <>
      <div className="w-1 h-16" />
      <div className="flex flex-col items-center max-w-6xl mx-auto px-6 py-20">
        <img src="/logo.svg" alt="Draconic ID logo" className="w-64 h-64 mb-8" />
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">{`Welcome home, ${session ? session.user.name : 'dragon'}`}</h1>
          <p className="text-lg">Welcome to the gateway for all things draconic, your place on the internet.</p>
        </div>
      </div>

      <div className="flex flex-col items-center max-w-6xl mx-auto py-20">

        <LandingMap className="h-100 w-full max-w-100 rounded-2xl overflow-hidden" />
        <div className="text-center px-6">
          <h1 className="text-4xl font-bold mb-4">Your cave, your people</h1>
          <p className="text-lg">Create a profile, a space to call your own through which others will get to know you. Optionally, add yourself to the <Link className='underline' href="/map">map</Link> and find dragons in your neighbourhood.</p>
        </div>
      </div>

      <div className="flex flex-col items-center max-w-6xl mx-auto px-6 py-20">
        <ResponsiveScale baseWidth={384} baseHeight={242.15} className="w-full px-4 mb-8">
          <CreditCard className="h-[242.15px] w-[384px] relative">
            <CreditCardFlipper>
              {/* FRONT */}
              <CreditCardFront className="bg-gradient-to-br from-[#e8f6ff] to-[#cfe8f6]">
                {/* Top band + title */}
                <div className="absolute -inset-x-6 -top-5 h-12 bg-gradient-to-r from-cyan-200/60 to-sky-200/60" />
                <div className="absolute -top-2 w-full text-center font-semibold tracking-[0.2em] text-slate-900 uppercase">Draconic Identity Card</div>

                {/* <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-r from-cyan-200/60 to-sky-200/60">
                <span className="text-slate-800 uppercase">Draconic Identity Card</span>
              </div> */}

                {/* Hologram / seal */}
                {/* <CreditCardLogo>
                <DragonSeal />
              </CreditCardLogo> */}

                {/* Portrait */}
                <Image alt="Portrait" width={128} height={128} className='absolute top-14 left-2 rounded-lg' src="/saphira.png" />

                {/* Primary fields */}
                <div className="absolute right-2 top-14 grid grid-cols-2 gap-x-0 gap-y-1 text-[11px] leading-4">
                  <div className="font-semibold text-slate-800">Name</div>
                  <div className="font-medium text-slate-700 -ml-3">Saphira Bjartskular</div>
                  <div className="font-semibold text-slate-800">Species</div>
                  <div className="font-medium text-slate-700 -ml-3">Draco Alagaësia</div>
                  <div className="font-semibold text-slate-800">Hatching</div>
                  <div className="font-medium text-slate-700 -ml-3">Year 7586</div>
                  <div className="font-semibold text-slate-800">Gender</div>
                  <div className="font-medium text-slate-700 -ml-3">Female</div>
                  <div className="font-semibold text-slate-800">Nationality</div>
                  <div className="font-medium text-slate-700 -ml-3">Alagaësia</div>
                </div>

                {/* Signature */}
                <Image alt="Signature" width={128} height={128} className='absolute -bottom-10 right-16' src="/signature.png" />

              </CreditCardFront>

              {/* BACK */}
              <CreditCardBack className="bg-gradient-to-br from-[#e8f6ff] to-[#cfe8f6]">

                {/* Legal line */}
                <div className="absolute left-4 top-0 text-[10px] tracking-wide text-slate-800">PROPERTY OF VROENGARD RIDERS’ COUNCIL · ISSUED 7986</div>

                {/* List */}
                <div className="absolute left-2 top-8 text-[12px]">
                  <div className="text-slate-800 font-semibold mb-1">Authorisations</div>
                  <ul className="space-y-1 text-slate-700">
                    <li className="flex items-center gap-2"><Flame className="h-3.5 w-3.5" />Breath Weapon</li>
                    <li className="flex items-center gap-2"><Plane className="h-3.5 w-3.5" />Flight Clearance</li>
                    <li className="flex items-center gap-2"><Brain className="h-3.5 w-3.5" />Telepathy Use</li>
                  </ul>
                  <br />
                  <div className="text-slate-800 font-semibold mb-1">Emergency Contact</div>
                  <div className="text-slate-700">Eragon Shadeslayer,</div>
                  <div className="text-slate-700">Dragon Rider</div>
                </div>

                {/* NFC icon */}
                <Nfc className="absolute w-10 h-10 right-0 top-8 text-slate-800" />

                {/* Barcode */}
                <div className="absolute h-10 w-28 grid grid-cols-24 gap-[2px] items-end bottom-12 right-2">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div key={i} className={i % 2 === 0 ? "h-full bg-slate-800" : "h-6 bg-slate-400"} />
                  ))}
                </div>

                {/* Decorative number line */}
                <CreditCardNumber className="absolute bottom-4 right-2 text-slate-800">DRG-0001-BLU</CreditCardNumber>
              </CreditCardBack>
            </CreditCardFlipper>
          </CreditCard>
        </ResponsiveScale>
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Fly wherever you want</h1>
          <p className="text-lg">Sign in to a variety of dragon-adjacent services, all using the same credentials. Head over to the <Link className="underline" href="https://auth.draconic.id/if/user/#/library">services</Link> section to find out what's waiting.</p>
        </div>
      </div>

      <div className="flex flex-col items-center max-w-6xl mx-auto px-6 py-20">
        <Terminal className="overflow-auto mb-8">
          <TypingAnimation className="text-wrap" delay={0} duration={30}>$ curl -s https://draconic.id/api/profile/lG7mek0BKHFamFI7 | jq</TypingAnimation>
          <AnimatedSpan delay={3000} className="text-wrap">Fetching...</AnimatedSpan>
          <AnimatedSpan delay={4000} className="text-wrap">Success!</AnimatedSpan>
          <AnimatedSpan delay={4500} className="text-wrap">
            {`
{
  "id": "lG7mek0BKHFamFI7",
  "name": "Bluefire",
  "tagline": "A western dragon with black scales and blue eyes.",
  "avatar": "https://minio.bluefi.re/draconic-id/avatars/c9477f33-0a55-4a4c-a399-4c7ce67aefd5",
  "about": "Welcome to my profile! I am Bluefire, the creator of Draconic ID. I am always looking to meet another dragon.",
  "latitude": 50.961281,
  "longitude": 5.909018,
  "createdAt": "2025-09-12T15:25:37.187Z",
  "updatedAt": "2025-09-26T12:05:14.144Z"
}
            `}
          </AnimatedSpan>
        </Terminal >
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Let dragons use your own apps</h1>
          <p className="text-lg">Whether it is letting people sign into your website with a Draconic ID, or fetching profiles programatically with an API, <Link href="https://mailhide.io/e/RPzCeWBk" className="underline">we're ready to help you out</Link>.</p>
        </div>
      </div >
    </>
  );
}
