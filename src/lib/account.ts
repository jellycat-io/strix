import axios, { isAxiosError } from "axios";

import type { EmailMessage, SyncResponse, SyncUpdatedResponse } from "@/types";

export class Account {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  async performInitialSync() {
    try {
      // Start the sync process
      let syncResponse = await this.startSync();
      while (!syncResponse.ready) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        syncResponse = await this.startSync();
      }

      // Get the bookmark delta token
      let storedDeltaToken: string = syncResponse.syncUpdatedToken;
      let updatedResponse = await this.getUpdatedEmails({
        deltaToken: storedDeltaToken,
      });

      if (updatedResponse.nextDeltaToken) {
        // Sync has completed
        storedDeltaToken = updatedResponse.nextDeltaToken;
      }

      let allEmails: EmailMessage[] = updatedResponse.records;

      // Fetch all pages if there are more
      while (updatedResponse.nextPageToken) {
        updatedResponse = await this.getUpdatedEmails({
          pageToken: updatedResponse.nextPageToken,
        });
        allEmails = allEmails.concat(updatedResponse.records);
        if (updatedResponse.nextDeltaToken) {
          // Sync has completed
          storedDeltaToken = updatedResponse.nextDeltaToken;
        }
      }

      console.log(`Initial sync completed. ${allEmails.length} emails synced`);

      return {
        emails: allEmails,
        deltaToken: storedDeltaToken,
      };
    } catch (err) {
      if (isAxiosError(err)) {
        console.error(
          "Error during sync:",
          JSON.stringify(err.response?.data, null, 2),
        );
      } else {
        console.error("Error during sync:", err);
      }
    }
  }

  async getUpdatedEmails({
    deltaToken,
    pageToken,
  }: {
    deltaToken?: string;
    pageToken?: string;
  }) {
    const params: Record<string, string> = {};
    if (deltaToken) params.deltaToken = deltaToken;
    if (pageToken) params.pageToken = pageToken;

    const res = await axios.get<SyncUpdatedResponse>(
      "https://api.aurinko.io/v1/email/sync/updated",
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
        params,
      },
    );

    return res.data;
  }

  private async startSync() {
    const res = await axios.post<SyncResponse>(
      "https://api.aurinko.io/v1/email/sync",
      {},
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
        params: {
          bodyType: "html",
          daysWithin: 2,
        },
      },
    );

    return res.data;
  }
}
