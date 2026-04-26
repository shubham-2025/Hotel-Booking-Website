import Link from "next/link";
import { toggleOwnerHotelAvailabilityAction } from "@/src/backend/owner/owner-hotel-actions";
import { getOwnerHotelBootstrapData } from "@/src/backend/repositories/owner-repository";
import { QueryStatusToast } from "@/src/frontend/components/feedback/query-status-toast.client";
import { PendingSubmitButton } from "@/src/frontend/components/shared/pending-submit-button.client";
import { OwnerPageHeader } from "@/src/frontend/components/owner/owner-page-header";
import { OwnerPropertyPreviewCard } from "@/src/frontend/components/owner/owner-property-preview-card";
import { OwnerStatGrid } from "@/src/frontend/components/owner/owner-stat-grid";
import { HotelSetupPanel } from "@/src/frontend/features/owner/hotel-setup-panel.client";

const noticeMessages = {
  owner_access_ready:
    "Your hosting space is ready. Add your property details to open the rest of the experience.",
  hotel_updated: "Your property details were refreshed successfully.",
  hotel_published:
    "Your property is now visible to travelers browsing available stays.",
  hotel_unpublished: "Your property has been returned to private viewing.",
};

const errorMessages = {
  hotel_not_found:
    "We could not find that property in your hosting space. Refresh and try again.",
  hotel_action_invalid: "We could not understand that property action.",
  hotel_visibility_failed:
    "We could not update property visibility right now. Please try again shortly.",
};

function formatHotelStatus(status) {
  if (!status) {
    return "Draft";
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
}

function VisibilityWorkspaceCard({ primaryHotel, isHotelActive }) {
  return (
    <aside className="rounded-[32px] border border-[rgba(205,220,236,0.96)] bg-[linear-gradient(180deg,#f8fbff,#ffffff)] p-5 shadow-[var(--shadow-soft)] sm:p-6">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
        Visibility
      </p>
      <h2 className="mt-3 font-display text-3xl text-[var(--color-ink)]">
        {isHotelActive ? "Open for discovery" : "Quietly private"}
      </h2>
      <p className="mt-3 text-sm leading-8 text-[var(--color-muted)]">
        {isHotelActive
          ? "Travelers can find this property while browsing public stays. Keep the listing open only when the core details and imagery feel current."
          : "Keep the property private until the story, address, and contact details feel complete and reassuring."}
      </p>

      <div className="mt-5 space-y-3">
        <div className="rounded-[22px] bg-white px-4 py-4 ring-1 ring-[var(--color-line)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
            Current state
          </p>
          <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
            {isHotelActive
              ? "Rooms can appear to guests only when both the hotel and the room itself are active."
              : "Even active rooms remain hidden until the hotel is published from this page."}
          </p>
        </div>

        <div className="rounded-[22px] bg-white px-4 py-4 ring-1 ring-[var(--color-line)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
            Contact path
          </p>
          <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
            Use a polished property profile here first, then move to room
            collection when the hotel is ready for guests.
          </p>
        </div>
      </div>

      <form action={toggleOwnerHotelAvailabilityAction} className="mt-6">
        <input type="hidden" name="hotelId" value={primaryHotel?._id || ""} />
        <input
          type="hidden"
          name="nextState"
          value={isHotelActive ? "unpublish" : "publish"}
        />
        <PendingSubmitButton
          idleLabel={isHotelActive ? "Pause visibility" : "Open to guests"}
          pendingLabel={
            isHotelActive ? "Updating visibility..." : "Opening to guests..."
          }
          className="button-primary min-h-11 w-full px-5"
        />
      </form>
    </aside>
  );
}

function SetupFormSection({ hotelSetupData, primaryHotel }) {
  return (
    <section className="rounded-[32px] border border-[rgba(205,220,236,0.96)] bg-white/96 p-5 shadow-[var(--shadow-soft)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
            Property details
          </p>
          <h2 className="mt-2 font-display text-3xl text-[var(--color-ink)]">
            Keep the profile clean and current
          </h2>
        </div>
      </div>

      <div className="mt-6">
        <HotelSetupPanel
          profile={hotelSetupData.profile}
          hotel={primaryHotel}
          mode={primaryHotel ? "edit" : "create"}
        />
      </div>
    </section>
  );
}

export async function OwnerHotelSetupScreen({ searchParams }) {
  const hotelSetupData = await getOwnerHotelBootstrapData();
  const params = (await searchParams) || {};
  const ownerName =
    hotelSetupData.profile?.full_name ||
    hotelSetupData.profile?.email ||
    "Owner";
  const noticeCode =
    typeof params.notice === "string" ? params.notice : "";
  const errorCode = typeof params.error === "string" ? params.error : "";
  const feedbackToast = (
    <QueryStatusToast
      noticeCode={noticeCode}
      errorCode={errorCode}
      noticeMessages={noticeMessages}
      errorMessages={errorMessages}
    />
  );

  if (hotelSetupData.status === "unavailable") {
    return (
      <div className="space-y-8">
        {feedbackToast}
        <OwnerPageHeader
          eyebrow="Property profile"
          title="Property details are temporarily unavailable"
          description={hotelSetupData.reason}
        />
      </div>
    );
  }

  if (hotelSetupData.status !== "no_hotel") {
    const primaryHotel = hotelSetupData.primaryHotel;
    const isHotelActive = primaryHotel?.status === "active";
    const stats = [
      {
        label: "Property status",
        value: formatHotelStatus(primaryHotel?.status),
        tone: "accent",
      },
      {
        label: "Hotels in workspace",
        value: hotelSetupData.metrics.totalHotels,
        tone: "neutral",
      },
      {
        label: "Room visibility rule",
        value: isHotelActive ? "Hotel open" : "Hotel private",
        tone: isHotelActive ? "success" : "warm",
      },
    ];

    return (
      <div className="space-y-8">
        {feedbackToast}
        <OwnerPageHeader
          eyebrow="Property profile"
          title="Present your hotel with clarity and confidence"
          description="Keep the hotel story, guest-facing details, and public visibility aligned from one structured workspace."
          actions={
            <>
              <Link href="/owner/list-room" className="button-primary min-h-11 px-5">
                Room collection
              </Link>
              <Link href="/owner" className="button-secondary min-h-11 px-5">
                Back to dashboard
              </Link>
            </>
          }
        />

        <OwnerStatGrid items={stats} columnsClass="md:grid-cols-3" />

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_320px]">
          <OwnerPropertyPreviewCard
            imageUrl={
              primaryHotel?.heroImageUrl ||
              "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop"
            }
            imageAlt={primaryHotel?.name}
            meta={
              <>
                <span className="rounded-full bg-[var(--color-accent-soft)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-accent-strong)]">
                  {formatHotelStatus(primaryHotel?.status)}
                </span>
                <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)] ring-1 ring-[var(--color-line)]">
                  {hotelSetupData.metrics.totalHotels} hotel
                  {hotelSetupData.metrics.totalHotels === 1 ? "" : "s"}
                </span>
              </>
            }
            name={primaryHotel?.name}
            location={`${primaryHotel?.city} | ${primaryHotel?.address}`}
            description={
              primaryHotel?.description ||
              "Use this page to keep the hotel story, imagery, and guest-facing details aligned before rooms go fully public."
            }
            amenities={primaryHotel?.amenities || []}
            note={
              isHotelActive
                ? "This property is open to discovery. Keep the content current so the listing feels trustworthy before guests ever open a room."
                : "This property is still private. Refine the details here first, then open it when the experience feels ready to present."
            }
          />
          <VisibilityWorkspaceCard
            primaryHotel={primaryHotel}
            isHotelActive={isHotelActive}
          />
        </div>

        <SetupFormSection
          hotelSetupData={hotelSetupData}
          primaryHotel={primaryHotel}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {feedbackToast}
      <OwnerPageHeader
        eyebrow="Property profile"
        title={`Welcome your first property, ${ownerName}`}
        description="Start with the hotel profile that rooms, pricing, and guest stays will build on. This page becomes the foundation for the rest of the owner workspace."
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <SetupFormSection hotelSetupData={hotelSetupData} primaryHotel={null} />

        <aside className="rounded-[32px] border border-[rgba(205,220,236,0.96)] bg-[linear-gradient(180deg,#f8fbff,#ffffff)] p-5 shadow-[var(--shadow-soft)] sm:p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
            Launch path
          </p>
          <div className="mt-4 space-y-3 text-sm leading-8 text-[var(--color-muted)]">
            <p>1. Save the property profile with its location, tone, and guest-facing essentials.</p>
            <p>2. Continue into room collection to add pricing, images, and availability.</p>
            <p>3. Open the hotel only when both the property and selected rooms are ready for public discovery.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
