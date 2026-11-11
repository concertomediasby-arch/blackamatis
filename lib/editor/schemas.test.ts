import { describe, expect, it } from "vitest";
import { competitionSchema, craftSchema, fieldErrors, partnerSchema, tuningRowSchema, wordCount, zoneSchema } from "./schemas";

describe("editor schemas", () => {
  it("accepts a competition with or without a date", () => {
    const base = { event: "EMMA Asian Finals", city: "", category: "", install_points: "", result: "", date: null };
    expect(fieldErrors(competitionSchema, base)).toEqual({});
    expect(fieldErrors(competitionSchema, { ...base, date: "2026-11-21" })).toEqual({});
    expect(fieldErrors(competitionSchema, { ...base, date: "21/11" }).date).toBeTruthy();
    expect(fieldErrors(competitionSchema, { ...base, event: "" }).event).toBe("Add the event name");
  });

  it("checks partner links only when given", () => {
    expect(fieldErrors(partnerSchema, { name: "STEG", url: null })).toEqual({});
    expect(fieldErrors(partnerSchema, { name: "STEG", url: "" })).toEqual({});
    expect(fieldErrors(partnerSchema, { name: "STEG", url: "steg.it" }).url).toMatch(/full URL/);
  });

  it("limits theme elements to 8", () => {
    expect(fieldErrors(zoneSchema, { name: "Trunk", elements: Array(9).fill("x") }).elements).toBe("Max 8 elements");
  });

  it("requires a driver name and a close-up caption", () => {
    expect(fieldErrors(tuningRowSchema, { driver: "", hpf_hz: "", lpf_hz: "", slope_db: "", time_align_ms: "", eq_bands: "" }).driver).toBeTruthy();
    expect(fieldErrors(craftSchema, { caption: "" }).caption).toBe("Add a caption");
  });

  it("counts statement words", () => {
    expect(wordCount("  one car   two faces ")).toBe(4);
    expect(wordCount("")).toBe(0);
  });
});
