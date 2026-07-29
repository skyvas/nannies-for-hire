export interface BrandTheme {
  primaryHsl: string;      // e.g. "221 83% 53%" (Emerald / Royal Blue)
  primaryForegroundHsl: string;
  accentHsl: string;       // Teal / Warm Amber accent
  bgHsl: string;
  cardHsl: string;
  textHsl: string;
  mutedHsl: string;
  radius: string;          // "0.75rem"
  fontFamily: string;
}

export interface BrandConfig {
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  logoPath: string;
  supportEmail: string;
  currency: string;
  currencySymbol: string;
  platformFeeRate: number; // 0.15 = 15%
  minBookingDurationHours: number;
  minAdvanceNoticeHours: number;
  requestExpirationHours: number;
  theme: BrandTheme;
  cities: { name: string; neighborhoods: string[] }[];
}

export const brandConfig: BrandConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || "Nannies for Hire",
  shortName: "NanniesForHire",
  tagline: "Trusted, Verified On-Demand Caregivers in Metro Vancouver",
  description: "Connect instantly with top-rated, background-vetted babysitters for evening and weekend childcare across Metro Vancouver.",
  logoPath: "/logo.svg",
  supportEmail: "support@nanniesforhire.ca",
  currency: "CAD",
  currencySymbol: "$",
  platformFeeRate: 0.15, // 15% marketplace commission
  minBookingDurationHours: 2,
  minAdvanceNoticeHours: 4,
  requestExpirationHours: 2,
  
  theme: {
    primaryHsl: "221 83% 53%",          // Dynamic Vibrant Blue/Teal
    primaryForegroundHsl: "210 40% 98%",
    accentHsl: "160 84% 39%",           // Emerald Green highlight
    bgHsl: "210 40% 98%",
    cardHsl: "0 0% 100%",
    textHsl: "222.2 84% 4.9%",
    mutedHsl: "210 40% 96.1%",
    radius: "0.75rem",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  
  cities: [
    {
      name: "Vancouver",
      neighborhoods: ["Downtown", "Kitsilano", "East Vancouver", "Yaletown", "Gastown", "Mount Pleasant", "Point Grey", "Kerrisdale"]
    },
    {
      name: "Burnaby",
      neighborhoods: ["Metrotown", "Brentwood", "Burnaby Heights", "Edmonds"]
    },
    {
      name: "Richmond",
      neighborhoods: ["City Centre", "Steveston", "Thompson", "Terra Nova"]
    },
    {
      name: "Surrey",
      neighborhoods: ["Guildford", "Fleetwood", "Newton", "South Surrey", "Whalley"]
    },
    {
      name: "North Vancouver",
      neighborhoods: ["Lonsdale", "Capilano", "Lynn Valley", "Deep Cove"]
    },
    {
      name: "Coquitlam",
      neighborhoods: ["Town Centre", "Burquitlam", "Maillardville"]
    }
  ]
};
