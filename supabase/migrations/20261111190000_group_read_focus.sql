-- Question and connection for a group or tandem read.
-- Added after 20261111180000_group_reads.sql shipped, so existing
-- databases pick up the columns. Fresh installs do too.

alter table public.group_reads
  add column if not exists question text,
  add column if not exists connection text,
  add column if not exists connection_note text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'group_reads_question_len') then
    alter table public.group_reads
      add constraint group_reads_question_len
      check (question is null or char_length(question) <= 500);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'group_reads_connection_len') then
    alter table public.group_reads
      add constraint group_reads_connection_len
      check (connection is null or char_length(connection) <= 80);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'group_reads_connection_note_len') then
    alter table public.group_reads
      add constraint group_reads_connection_note_len
      check (connection_note is null or char_length(connection_note) <= 120);
  end if;
end $$;
