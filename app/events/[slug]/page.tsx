import BookEvent from "@/components/BookEvent";
import Image from "next/image";
import { notFound } from "next/navigation";
import React from "react";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
let bookings = 10;

const EventDetailItem = ({
  icon,
  alt,
  label,
}: {
  icon: string;
  alt: string;
  label: string;
}) => (
  <div className="flex-row-gap-2 items-center">
    <Image src={icon} alt={alt} width={17} height={17} />
    <p>{label}</p>
  </div>
);

const EventAgenda = ({ agendaItems }: { agendaItems: string[] }) => (
  <div>
    <h2>Agenda</h2>
    <ul>
      {agendaItems.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  </div>
);

const EventTags = ({ tags }: { tags: string[] }) => (
  <div className="flex flex-row gap-1.5 flex-wrap">
    {tags.map((tag) => (
      <div className="pill" key={tag}>
        {tag}
      </div>
    ))}
  </div>
);

const page = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;

  const request = await fetch(`${BASE_URL}/api/events/${slug}`);
  const {
    event: {
      description,
      image,
      overview,
      date,
      time,
      location,
      mode,
      agenda,
      audience,
      organizer,
      tags,
    },
  } = await request.json();

  if (!description) return notFound();

  return (
    <section id="event">
      <div className="header">
        <h1>Event Description</h1>
        <p>{description}</p>
      </div>
      <div className="details">
        {/* left side -event contents */}
        <div className="content">
          <Image
            src={image}
            alt="event image"
            height={800}
            width={800}
            className="banner"
          />

          <section className="flex-col-gap-3">
            <h2>Overview</h2>
            <p>{overview}</p>
          </section>
          <section>
            <h2>Event Details</h2>
            <EventDetailItem
              icon="/icons/calendar.svg"
              alt="calender"
              label={date}
            />
            <EventDetailItem icon="/icons/clock.svg" alt="time" label={time} />
            <EventDetailItem
              icon="/icons/pin.svg"
              alt="calender"
              label={location}
            />
            <EventDetailItem
              icon="/icons/mode.svg"
              alt="calender"
              label={mode}
            />
            <EventDetailItem
              icon="/icons/audience.svg"
              alt="calender"
              label={audience}
            />
          </section>

          <EventAgenda agendaItems={JSON.parse(agenda[0])} />

          <section className="flex-col-gap-2">
            <h2>About the Organizer</h2>
            <p>{organizer}</p>
          </section>

          <EventTags tags={JSON.parse(tags[0])} />
        </div>

        {/* right side- booking  form*/}
        <aside className="booking">
          <div className="signup-card">
            <p className="text-lg font-semibold">Book Your Spot</p>
            {bookings > 0 ? (
              <p className="text-sm">
                Join {bookings} people who have already booked their spot!
              </p>
            ) : (
              <p className="text-sm"> Be the first to book your spot</p>
            )}

            <BookEvent />
          </div>
        </aside>
      </div>
    </section>
  );
};

export default page;
