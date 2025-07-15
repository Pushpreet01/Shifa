import { Alert } from "react-native";

interface ProfanityCheckResponse {
  has_profanity: boolean;
}

class ProfanityFilterService {
  private static API_KEY = process.env.EXPO_PUBLIC_API_NINJAS_KEY;
  private static API_URL = "https://api.api-ninjas.com/v1/profanityfilter";

  static async hasProfanity(text: string): Promise<boolean> {
    if (!this.API_KEY) {
      console.error("API Ninjas key not found in environment variables");
      return false;
    }

    try {
      const response = await fetch(
        `${this.API_URL}?text=${encodeURIComponent(text)}`,
        {
          method: "GET",
          headers: {
            "X-Api-Key": this.API_KEY,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorBody = await response.text();
        console.error("Profanity check API response not OK:", {
          status: response.status,
          statusText: response.statusText,
          body: errorBody,
        });
        throw new Error("Failed to check profanity");
      }

      const data: ProfanityCheckResponse = await response.json();
      return data.has_profanity;
    } catch (error) {
      console.error("Error checking profanity:", error);
      return false; // In case of API failure, we'll let the text through
    }
  }

  static async filterText(text: string): Promise<string> {
    if (!this.API_KEY) {
      console.error("API Ninjas key not found in environment variables");
      return text;
    }

    try {
      const response = await fetch(
        `${this.API_URL}?text=${encodeURIComponent(text)}`,
        {
          method: "GET",
          headers: {
            "X-Api-Key": this.API_KEY,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorBody = await response.text();
        console.error("Profanity filter API response not OK:", {
          status: response.status,
          statusText: response.statusText,
          body: errorBody,
        });
        throw new Error("Failed to filter profanity");
      }

      const data = await response.json();
      return data.censored || text;
    } catch (error) {
      console.error("Error filtering profanity:", error);
      return text; // In case of API failure, return original text
    }
  }
}

export default ProfanityFilterService;
