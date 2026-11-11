import { describe, expect, it } from "vitest";
import { isUuid, stableUuid } from "./ids";

describe("stableUuid", () => {
  it("keeps real UUIDs", async () => {
    expect(await stableUuid("AF812089-DB85-4224-AE27-5C1023B5A48E")).toBe("af812089-db85-4224-ae27-5c1023b5a48e");
  });

  it("maps the same placeholder id to the same UUID every time", async () => {
    const a = await stableUuid("vehicle");
    expect(isUuid(a)).toBe(true);
    expect(await stableUuid("vehicle")).toBe(a);
  });

  it("gives different ids different UUIDs", async () => {
    expect(await stableUuid("m-12")).not.toBe(await stableUuid("m-13"));
    expect(await stableUuid("new-1")).not.toBe(await stableUuid("new-2"));
  });
});
