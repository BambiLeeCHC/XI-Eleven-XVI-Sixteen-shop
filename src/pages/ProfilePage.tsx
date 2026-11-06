import { Link, useNavigate } from "react-router-dom";
import { TrueNorthAtmosphere } from "../components/journal/TrueNorthAtmosphere";
import { PersonalProfile } from "../components/north/PersonalProfile";
import { api, useAuthActions, useQuery } from "../lib/backend";
import { useNorthSocial } from "../lib/useNorthSocial";

export function ProfilePage() {
  const user = useQuery(api.auth.currentUser);
  const isAdmin = useQuery(api.users.isAdmin);
  const social = useNorthSocial();
  const { signOut } = useAuthActions();
  const navigate = useNavigate();

  return (
    <div className="journal-page journal-page--truenorth">
      <TrueNorthAtmosphere />
      <div className="journal-stack tn-shell tn-profile">
        {user === undefined ? (
          <p className="serif-quiet tn-opening" role="status">
            Opening your profile…
          </p>
        ) : (
          <PersonalProfile
            surface="account"
            state={social.state}
            update={social.update}
            showNav
          />
        )}

        <footer className="tn-profile__foot">
          <Link to="/orders" className="tn-inline">
            Orders
          </Link>
          <Link to="/shop" className="tn-inline">
            Shop
          </Link>
          <Link to="/chart/circle" className="tn-inline">
            Tandem
          </Link>
          {isAdmin && (
            <Link to="/admin" className="tn-inline">
              Admin
            </Link>
          )}
          <button
            type="button"
            className="cta-ghost tn-action"
            onClick={async () => {
              await signOut();
              navigate("/");
            }}
          >
            Sign out
          </button>
        </footer>
      </div>
    </div>
  );
}
