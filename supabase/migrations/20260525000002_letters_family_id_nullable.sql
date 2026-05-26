-- letters.family_id should be nullable: solo users without a family can still
-- write letters to themselves or named recipients before forming a family.
alter table public.letters alter column family_id drop not null;
