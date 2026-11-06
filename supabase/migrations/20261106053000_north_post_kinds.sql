-- Profile notes and number shares join the existing social posts.
alter table public.north_posts drop constraint if exists north_posts_kind_check;
alter table public.north_posts
  add constraint north_posts_kind_check
  check (kind in ('pull', 'spread', 'chart', 'tandem', 'bulletin', 'note', 'number'));
