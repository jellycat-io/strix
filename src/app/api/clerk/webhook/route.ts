// /api/clerk/webhook

import { db } from "@/server/db";

export const POST = async (req: Request) => {
  try {
    const { data } = await req.json();
    if (!data) {
      throw new Error("No data received from clerk");
    }

    await db.user.create({
      data: {
        id: data.id,
        email: data.email_addresses[0].email_address,
        firstName: data.first_name,
        lastName: data.last_name,
        imageUrl: data.image_url,
      },
    });

    return new Response("Webhook received", { status: 200 });
  } catch (err) {
    console.error("Error receiving clerk webhook:", err);
  }
};
