"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface StepCard {
  step: string;
  title: string;
  desc: string;
  image: string;
  bgGradient: string;
  shadowColor: string;
  glowColor: string;
}

const STEPS: StepCard[] = [
  {
    step: "01",
    title: "Paste the\nVideo Link",
    desc: "Copy the link of any video from YouTube, Instagram, TikTok, Facebook, or X and paste it into the box above.",
    image: "/images/how-it-works/step1-link.png",
    bgGradient: "bg-gradient-to-br from-[#4D9AF4] via-[#2D8AF4] to-[#1E74DD]",
    shadowColor: "shadow-[0_20px_40px_-15px_rgba(45,138,244,0.45)] hover:shadow-[0_28px_50px_-10px_rgba(45,138,244,0.6)]",
    glowColor: "bg-[#B7D5F9]/40",
  },
  {
    step: "02",
    title: "Choose Your\nQuality",
    desc: "Pick the resolution you want — from 720p and 1080p HD up to 4K, or choose MP3 if you only need the audio.",
    image: "/images/how-it-works/step2-quality.png",
    bgGradient: "bg-gradient-to-br from-[#3D91F4] via-[#2279E5] to-[#1664C0]",
    shadowColor: "shadow-[0_20px_40px_-15px_rgba(34,121,229,0.45)] hover:shadow-[0_28px_50px_-10px_rgba(34,121,229,0.6)]",
    glowColor: "bg-[#A1CAF8]/40",
  },
  {
    step: "03",
    title: "Download Your\nFile",
    desc: "Click Download. The video and audio are combined with working sound and saved directly to your device.",
    image: "/images/how-it-works/step3-download.png",
    bgGradient: "bg-gradient-to-br from-[#2D8AF4] via-[#1B70DE] to-[#1158B8]",
    shadowColor: "shadow-[0_20px_40px_-15px_rgba(27,112,222,0.45)] hover:shadow-[0_28px_50px_-10px_rgba(27,112,222,0.6)]",
    glowColor: "bg-[#99C4FB]/40",
  },
];

export function HowItWorks() {
  const scrollToInput = () => {
    const el = document.getElementById("download-input");
    if (!el) return;
    const lenis = (window as unknown as { lenis?: { scrollTo: (target: HTMLElement, options?: object) => void } }).lenis;
    if (lenis) {
      lenis.scrollTo(el, { offset: -100, duration: 1.2 });
    } else {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <section id="how-it-works" className="relative overflow-hidden py-16 sm:py-20 bg-[#f5faff] transition-colors scroll-mt-6">
      {/* Atmospheric Depth Blur field starting from bottom-left spreading into 1/3rd of the section */}
      <div
        aria-hidden="true"
        className="absolute -bottom-20 -left-24 w-[500px] sm:w-[680px] lg:w-[820px] h-[340px] sm:h-[420px] rounded-full pointer-events-none select-none blur-[90px] sm:blur-[130px] opacity-75"
        style={{
          background:
            "radial-gradient(ellipse at bottom left, rgba(77, 154, 244, 0.42) 0%, rgba(134, 184, 243, 0.28) 45%, rgba(183, 213, 249, 0.12) 75%, transparent 100%)",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-2xl mx-auto mb-10 sm:mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            How to Download Videos
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600">
            Save any video or audio file in three simple steps.
          </p>
        </motion.div>

        {/* 3 Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7">
          {STEPS.map((card, idx) => {
            return (
              <motion.div
                key={card.step}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                onClick={scrollToInput}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-[28px] sm:rounded-[32px] ${card.bgGradient} p-6 sm:p-7 h-[330px] sm:h-[350px] text-white transition-all duration-300 hover:-translate-y-1.5 cursor-pointer ${card.shadowColor}`}
              >
                {/* 1. Semicircle-Matched Top-Corner Ambient Specular Glow */}
                <div
                  className={`absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl pointer-events-none ${card.glowColor}`}
                />

                {/* 2. Soft Atmospheric Semicircle Blue Bloom */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 rounded-full bg-[#86B8F3]/25 blur-3xl pointer-events-none" />

                {/* 3. Deep Semicircle Core Blue Bottom Vignette */}
                <div className="absolute -bottom-14 -left-14 w-52 h-52 rounded-full bg-[#1664C0]/35 blur-2xl pointer-events-none" />

                {/* 4. Bottom-Left to 1/3rd Depth Blurred Light Aura */}
                <div
                  aria-hidden="true"
                  className="absolute bottom-0 left-0 w-[80%] h-[35%] rounded-bl-[28px] sm:rounded-bl-[32px] pointer-events-none select-none blur-2xl opacity-65"
                  style={{
                    background:
                      "radial-gradient(circle at bottom left, rgba(255, 255, 255, 0.35) 0%, rgba(183, 213, 249, 0.22) 45%, transparent 80%)",
                  }}
                />

                {/* 5. Optical Depth Blur covering the bottom 1/3rd with smooth vertical fade */}
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-[34%] rounded-b-[28px] sm:rounded-b-[32px] pointer-events-none select-none backdrop-blur-[3px]"
                  style={{
                    maskImage:
                      "linear-gradient(to top, black 0%, rgba(0,0,0,0.65) 45%, transparent 100%)",
                    WebkitMaskImage:
                      "linear-gradient(to top, black 0%, rgba(0,0,0,0.65) 45%, transparent 100%)",
                  }}
                />

                {/* Card Header: Title with Step Number & Description */}
                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="whitespace-pre-line text-xl sm:text-2xl font-extrabold tracking-tight text-white leading-tight">
                      {card.title}
                    </h3>
                    <span className="font-poppins font-extrabold text-3xl sm:text-4xl tracking-tight text-white/30 select-none pointer-events-none shrink-0 -mt-0.5 leading-none">
                      {card.step}
                    </span>
                  </div>
                  <p className="mt-2 text-xs sm:text-[13px] leading-relaxed text-blue-100/90 font-normal max-w-[270px]">
                    {card.desc}
                  </p>
                </div>

                {/* Middle/Bottom Visual Stage with Layered Blurred Aura */}
                <div className="relative w-full flex-1 flex items-center justify-center overflow-visible mt-1">
                  {/* Blurred 3D Depth Echo matching the reference image blurred effect */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-45 blur-xl scale-110 pointer-events-none select-none">
                    <Image
                      src={card.image}
                      alt=""
                      width={220}
                      height={220}
                      className="w-full h-full object-contain"
                      aria-hidden="true"
                    />
                  </div>

                  {/* Sharp 3D Floating Illustration */}
                  <div className="relative z-10 w-full h-44 sm:h-48 flex items-center justify-center">
                    <Image
                      src={card.image}
                      alt={card.title.replace("\n", " ")}
                      width={240}
                      height={240}
                      className="w-full h-full object-contain transition-transform duration-500 ease-out group-hover:scale-105 select-none pointer-events-none drop-shadow-md"
                      priority
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}


