import { describe, expect, it } from "vitest";
import {
  HOME_DEFAULTS,
  categoryLabel,
  headerLabel,
  heroText,
  normalizeHome,
} from "./home";

describe("heroText", () => {
  it("uses the defaults when nothing is set", () => {
    const t = heroText(null, "Expert Unlimited");
    expect(t.eyebrow).toBe("EMMA 2026 · Expert Unlimited");
    expect(t.titleLines).toEqual(["One car.", "Two faces."]);
    expect(t.intro).toBe(HOME_DEFAULTS.intro);
    expect(t.cta).toBe("Explore the build");
    expect(t.showStrip).toBe(true);
  });

  it("uses the team's text, one headline line per line break", () => {
    const t = heroText(
      {
        eyebrow: "EMMA Asia Final",
        title: "Born\n\nfor the final",
        intro: "Two years.",
        cta: "Look inside",
        show_strip: false,
      },
      "Expert",
    );
    expect(t).toEqual({
      eyebrow: "EMMA Asia Final",
      titleLines: ["Born", "for the final"],
      intro: "Two years.",
      cta: "Look inside",
      showStrip: false,
    });
  });

  it("caps text lengths", () => {
    expect(normalizeHome({ cta: "x".repeat(100) }).cta).toHaveLength(30);
  });
});

describe("categoryLabel", () => {
  it("shows the class once when the category repeats it", () => {
    expect(categoryLabel("EXPERT UNLIMITED", "Expert Unlimited")).toBe(
      "Expert Unlimited",
    );
    expect(categoryLabel("Install", "Expert")).toBe("Install · Expert");
    expect(categoryLabel("", "Master")).toBe("Master");
  });
});

describe("headerLabel", () => {
  it("uses the team's label, else EMMA 2026 · category", () => {
    expect(headerLabel(null, "Expert Unlimited")).toBe(
      "EMMA 2026 · Expert Unlimited",
    );
    expect(headerLabel({ label: "  EMMA Asia Final 2026 " }, "X")).toBe(
      "EMMA Asia Final 2026",
    );
    expect(headerLabel({}, "")).toBe("EMMA 2026 · …");
  });
});
