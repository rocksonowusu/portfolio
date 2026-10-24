import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

// Imported only from client components; registration is a no-op on the server.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
  // development only: lets tests count live ScrollTriggers to catch leaks between routes
  if (process.env.NODE_ENV !== "production") Object.assign(window, { __ScrollTrigger: ScrollTrigger });
}

export { gsap, ScrollTrigger, SplitText, useGSAP };
