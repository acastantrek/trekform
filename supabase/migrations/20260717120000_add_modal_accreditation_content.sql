-- Adds per-course fields for the enrollment modal's accreditation block and
-- "Qué recibirás" list, matching the live inscripciones.trekcom.online modal
-- (dynamic accreditation heading + variable-length item lists). Both are
-- plain newline-separated text, same convention as the existing
-- courses.objectives column, so no new admin UI pattern is needed.
-- Nullable with no default: EnrollmentModal falls back to the existing
-- objectives-derived behavior when empty.

alter table public.courses
  add column if not exists accreditation_title text,
  add column if not exists accreditation_items text,
  add column if not exists benefits_items text;
