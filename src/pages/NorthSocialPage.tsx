import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CompassRose } from "../components/north/CompassRose";
import { FriendsBoard, PersonalProfile } from "../components/north/PersonalProfile";
import { FilteredFeed } from "../components/north/SocialFeed";
import { SEO } from "../components/SEO";
import { TrueNorthAtmosphere } from "../components/journal/TrueNorthAtmosphere";
import { PAGE_SEO } from "../data/seoMeta";
import { useAuthStatus } from "../lib/backend";
import {
  addFriend,
  circleViewFromHash,
  overallFeed,
} from "../lib/northSocial";
import { useNorthSocial } from "../lib/useNorthSocial";
import { TrueNorthNav } from "./chart/shared";

export function NorthSocialPage() {
  const social = useNorthSocial();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuthStatus();
  const view = circleViewFromHash(location.hash);
  const [story, setStory] = useState<string | null>(null);
  const posts = overallFeed(social.state);
  const storyPost = social.state.posts.find(post => post.id === story);
  const seo = PAGE_SEO.chart;

  const openPerson = (id: string) => {
    navigate({ pathname: "/chart", search: `?soul=${id}`, hash: "chart" });
  };

  return (
    <div className="journal-page journal-page--truenorth north-social">
      <TrueNorthAtmosphere />
      <div className="journal-stack tn-shell">
        <SEO title={seo.title} description={seo.description} url="/chart" />
        <header className="tn-card north-social__head">
          <div className="north-social__brand">
            <CompassRose />
            <div>
              <p className="label-lock">The Circle</p>
              <h1 className="clash north-social__title">True North</h1>
              <p className="serif-quiet tn-lede">Your sky, the people you keep, and what you post from here.</p>
            </div>
          </div>
          <TrueNorthNav />
        </header>

        {!isAuthenticated && !isLoading && (
          <p className="tn-meta">
            This sky is saved on this browser. <Link to="/login" className="tn-inline">Sign in</Link> to tie it to your birth chart.
          </p>
        )}

        {view === "feed" && (
          <div className="sky-feed-page">
            <div className="story-row" aria-label="Recent posts">
              {posts.slice(0, 8).map(post => (
                <button key={post.id} type="button" className="story-ring" onClick={() => setStory(post.id)}>
                  <span>{post.sign.slice(0, 2)}</span>
                  <small>{post.author}</small>
                </button>
              ))}
            </div>
            {(social.state.suggested ?? []).length > 0 && (
              <section className="tn-card" aria-label="Suggested souls">
                <p className="label-lock">Suggested souls</p>
                <p className="serif-quiet tn-lede">Add someone and their posts land in this feed.</p>
                <ul className="friend-board">
                  {(social.state.suggested ?? []).map(person => (
                    <li key={person.id} className="friend-row">
                      <button type="button" className="friend-row__name" onClick={() => openPerson(person.id)}>
                        {person.name}
                      </button>
                      <button
                        type="button"
                        className="cta-pist tn-action"
                        data-testid={`add-friend-${person.handle}`}
                        onClick={() => social.update(current => addFriend(current, person.id))}
                      >
                        + Add Friend
                      </button>
                      <span className="friend-row__meta tn-meta">@{person.handle} · {person.vibe}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            <FilteredFeed posts={posts} update={social.update} testId="overall-feed" />
          </div>
        )}

        {view === "sky" && (
          <PersonalProfile surface="circle" state={social.state} update={social.update} />
        )}

        {view === "friends" && (
          <FriendsBoard state={social.state} update={social.update} onOpen={openPerson} />
        )}

        {storyPost && (
          <div className="story-modal" role="dialog" aria-modal="true" aria-label={storyPost.title}>
            <article className="tn-card">
              <p className="label-lock">{storyPost.author} · {storyPost.sign}</p>
              <h2 className="clash north-post__title">{storyPost.title}</h2>
              <p className="serif-quiet tn-lede">{storyPost.body}</p>
              <button type="button" className="cta-ghost tn-action" onClick={() => setStory(null)}>Close</button>
            </article>
          </div>
        )}
      </div>
    </div>
  );
}
