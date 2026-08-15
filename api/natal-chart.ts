/**
 * The free natal chart — given in full at registration, no paywall.
 *
 * Requires birth_date + birth_location on the profile (birth_time is
 * optional; without it the chart is computed for local noon and flagged
 * `approximateTime`). Geocodes birth_location once and caches lat/lng on
 * the profile row so repeat views don't re-hit the geocoder.
 */

import {
  type ApiRequest,
  type ApiResponse,
  currentUser,
  fail,
  HttpError,
  supabaseAdmin,
} from "./_lib/server.js";
import { computeNatalChart, geocodeLocation } from "./_lib/natalChart.js";

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const user = await currentUser(req);
    if (!user) throw new HttpError(401, "Please sign in first");

    const admin = supabaseAdmin();
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("birth_date, birth_time, birth_location, birth_lat, birth_lng")
      .eq("id", user.id)
      .maybeSingle();
    if (profileError) throw profileError;

    if (!profile?.birth_date) {
      return res.status(200).json({
        success: false,
        reason: "missing_birth_date",
        message: "Add your birth date in your account to generate a natal chart.",
      });
    }
    if (!profile?.birth_location) {
      return res.status(200).json({
        success: false,
        reason: "missing_birth_location",
        message: "Add your birth location in your account to generate a natal chart.",
      });
    }

    let lat = profile.birth_lat != null ? Number(profile.birth_lat) : null;
    let lng = profile.birth_lng != null ? Number(profile.birth_lng) : null;

    if (lat == null || lng == null) {
      const geo = await geocodeLocation(profile.birth_location);
      if (!geo) {
        return res.status(200).json({
          success: false,
          reason: "geocode_failed",
          message:
            "We couldn't place that birth location on the map — try a more specific city and state/country.",
        });
      }
      lat = geo.lat;
      lng = geo.lng;
      // Cache it — best-effort, don't fail the request if this write fails.
      await admin
        .from("profiles")
        .update({ birth_lat: lat, birth_lng: lng })
        .eq("id", user.id);
    }

    const chart = computeNatalChart(profile.birth_date, profile.birth_time, {
      lat,
      lng,
    });

    return res.status(200).json({ success: true, chart });
  } catch (error) {
    return fail(res, error);
  }
}
