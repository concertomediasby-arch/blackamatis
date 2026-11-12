"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Card,
  PageTitle,
  SelectField,
  TextArea,
  TextField,
} from "@/components/editor/Field";
import { useEditor } from "@/components/editor/EditorProvider";
import { UploadZone } from "@/components/editor/UploadZone";
import {
  HomeHeroEditor,
  WorkshopCardEditor,
} from "@/components/editor/sections/HomeHeroEditor";
import { PageLayoutsEditor } from "@/components/editor/sections/PageLayoutsEditor";
import { PartnersEditor } from "@/components/editor/sections/PartnersEditor";
import { MediaListEditor } from "@/components/editor/sections/MediaListEditor";
import { ScaledPreview } from "@/components/editor/ScaledPreview";
import { StatementSection } from "@/components/public/HomeSections";
import { MediaGallery } from "@/components/public/MediaGallery";
import { normalizeMedia } from "@/lib/bonus-media";
import {
  STATEMENT_MAX_WORDS,
  storyFormSchema,
  vehicleSchema,
  wordCount,
  type StoryForm,
} from "@/lib/editor/schemas";
import { CarPositioner } from "@/components/editor/CarPositioner";
import { CLASSES, CLASS_INFO } from "@/lib/emma/matrix";

/** Vehicle fields edited by this form (see the watch() sync below). */
const FORM_KEYS = Object.keys(
  vehicleSchema.shape,
) as (keyof typeof vehicleSchema.shape)[];

export default function VehiclePage() {
  const { content, update } = useEditor();
  const v = content.vehicle;

  const form = useForm<StoryForm>({
    resolver: zodResolver(storyFormSchema),
    mode: "onChange",
    defaultValues: {
      ...v,
      team: [...content.team].sort((a, b) => a.sort - b.sort),
    },
  });
  const { register, watch, formState } = form;
  const e = formState.errors;
  // Team rows are kept as they are (the home page shows one Built by card instead, see WorkshopCardEditor).

  // Mirror form values into the editor draft (autosave picks them up).
  useEffect(() => {
    const sub = watch((val) => {
      const { team: t, ...formVehicle } = val as StoryForm &
        Record<string, unknown>;
      // Copy only the fields this form edits. Everything else on the vehicle (row id,
      // car photo, its position, bookkeeping) is changed elsewhere and must not be
      // overwritten by the form's initial values.
      const vehicle = Object.fromEntries(
        FORM_KEYS.filter((k) => k in formVehicle).map((k) => [
          k,
          formVehicle[k],
        ]),
      );
      update((c) => ({
        ...c,
        vehicle: { ...c.vehicle, ...vehicle },
        team: (t ?? []).map((m, i) => ({ ...m, sort: i + 1 })),
      }));
    });
    return () => sub.unsubscribe();
  }, [watch, update]);

  const words = wordCount(watch("statement") ?? "");

  return (
    <form
      noValidate
      onSubmit={(ev) => ev.preventDefault()}
      className="flex flex-col gap-6"
    >
      <PageTitle title="Vehicle & Story">
        Vehicle data, the two faces, the project statement, the History story
        and the team.
      </PageTitle>

      <Card title="Vehicle" id="vehicle">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <TextField
            label="Project name"
            {...register("name")}
            error={e.name?.message}
          />
          <TextField
            label="Car"
            {...register("model")}
            error={e.model?.message}
          />
          <TextField
            label="Year / generation"
            placeholder="[YEAR]"
            {...register("year")}
            error={e.year?.message}
          />
          <TextField
            label="EMMA category"
            placeholder="[CATEGORY]"
            {...register("category")}
            error={e.category?.message}
            hint="Shown in the header pill."
          />
          <SelectField
            label="Install class"
            {...register("class")}
            error={e.class?.message}
          >
            {CLASSES.map((k) => (
              <option key={k} value={k}>
                {CLASS_INFO[k].label} · {CLASS_INFO[k].name}
              </option>
            ))}
          </SelectField>
          <TextField
            label="Event"
            {...register("event")}
            error={e.event?.message}
          />
        </div>
        <div id="f-car-photo">
          <UploadZone
            label="Hero car photo (transparent PNG)"
            kind="photo"
            folder="vehicle"
            value={v.car_photo_path}
            onChange={(p) =>
              update((c) => ({
                ...c,
                vehicle: { ...c.vehicle, car_photo_path: p },
              }))
            }
            hint="Cut-out photo on a transparent background. Shown over the AMATIS word."
            focusable={false}
          />
        </div>
        <CarPositioner
          path={v.car_photo_path}
          layout={v.car_photo_layout}
          onChange={(l) =>
            update((c) => ({
              ...c,
              vehicle: { ...c.vehicle, car_photo_layout: l },
            }))
          }
        />
        <MediaListEditor
          label="More car photos (hero slider)"
          intro="Extra cut-out photos (transparent PNG) of the car, e.g. other angles. Visitors swipe through them on the landing page after the photo above. They use the same position & size."
          folder="vehicle"
          numbered={false}
          photosOnly
          value={normalizeMedia(v.hero_photos)}
          onChange={(list) =>
            update((c) => ({
              ...c,
              vehicle: { ...c.vehicle, hero_photos: list },
            }))
          }
        />
      </Card>

      <div id="faces">
        <Card title="Two faces">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <TextField
              label="Dark side name"
              {...register("dark_side_name")}
              error={e.dark_side_name?.message}
            />
            <TextField
              label="Light side name"
              {...register("light_side_name")}
              error={e.light_side_name?.message}
            />
            <TextArea
              label="Dark side description"
              {...register("dark_side_body")}
              error={e.dark_side_body?.message}
            />
            <TextArea
              label="Light side description"
              {...register("light_side_body")}
              error={e.light_side_body?.message}
            />
          </div>
        </Card>
      </div>

      <Card title="Statement & story">
        <div id="f-statement">
          <TextArea
            label="Project statement"
            {...register("statement")}
            error={e.statement?.message}
            hint={
              <span
                aria-live="polite"
                className={
                  words > STATEMENT_MAX_WORDS
                    ? "font-semibold text-red-700"
                    : ""
                }
              >
                {words} / {STATEMENT_MAX_WORDS} words
              </span>
            }
          />
        </div>
        <ScaledPreview label="Preview of the project statement">
          <StatementSection statement={v.statement} />
        </ScaledPreview>
        <div id="f-story">
          <TextArea
            label="History summary"
            {...register("story")}
            error={e.story?.message}
          />
        </div>
        <div id="f-history-photo">
          <MediaListEditor
            label="History slider (photos or videos)"
            intro="Under the story, shown as a slider visitors can swipe. Each slide is a photo or a video (uploaded file or YouTube link). A photo shows whole in its frame; use Position & size to move or enlarge it. The caption is optional."
            folder="history"
            numbered={false}
            positionable
            value={normalizeMedia(v.history_photos)}
            onChange={(list) =>
              update((c) => ({
                ...c,
                vehicle: { ...c.vehicle, history_photos: list },
              }))
            }
          />
        </div>
        <div id="f-history-gallery">
          <MediaListEditor
            label="History gallery (square tiles)"
            intro="Square tiles under the slider, filling the row from left to right (2 per row on phones, up to 6 on wide screens). Photos or videos; a click opens them large. Set the crop focus so the square shows the right part. The caption is optional."
            folder="history"
            numbered={false}
            value={normalizeMedia(v.history_gallery)}
            onChange={(list) =>
              update((c) => ({
                ...c,
                vehicle: { ...c.vehicle, history_gallery: list },
              }))
            }
          />
          <ScaledPreview label="Preview of the History gallery">
            <div className="px-10 py-8">
              <MediaGallery items={normalizeMedia(v.history_gallery)} label="Gallery preview" />
            </div>
          </ScaledPreview>
        </div>
      </Card>

      <HomeHeroEditor />

      <PageLayoutsEditor />

      <Card title="Team & links" id="team">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <TextField
            label="Owner"
            {...register("owner")}
            error={e.owner?.message}
            hint="Leave empty to keep the owner's name off the site and the evidence pack."
          />
          <TextField
            label="Installer / workshop"
            hint="Shown as the Built by card on the home page."
            {...register("installer")}
            error={e.installer?.message}
          />
          <TextField
            label="Designer"
            {...register("designer")}
            error={e.designer?.message}
          />
          <TextField
            label="Tuner"
            {...register("tuner")}
            error={e.tuner?.message}
          />
          <TextField
            label="Instagram"
            placeholder="@handle"
            {...register("instagram")}
            error={e.instagram?.message}
          />
          <TextField
            label="Website"
            type="url"
            placeholder="https://"
            {...register("website")}
            error={e.website?.message}
          />
        </div>
      </Card>

      <WorkshopCardEditor />

      <PartnersEditor />
    </form>
  );
}
