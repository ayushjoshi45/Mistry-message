import dbConnect from "@/lib/dbConnect";
import { z } from "zod";
import UserModel from "@/models/User";
import { usernameValidation } from "@/schema/signUpSchema";
import { request } from "http";

const UsernameQuerySchema = z.object({
  username: usernameValidation,
});

export async function GET(req: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);

    const query = {
      username: searchParams.get("username"),
    };

    const result = UsernameQuerySchema.safeParse(query);
    console.log("Zod validation result:", result); // remove in production

    // ❌ Validation Failed
    if (!result.success) {
      const usernameError =
        result.error.format().username?._errors || [];

      return Response.json(
        {
          success: false,
          message:
            usernameError.length > 0
              ? usernameError.join(", ")
              : "Invalid query parameter",
        },
        { status: 400 }
      );
    }

    // Extract validated username
    const { username } = result.data;

    // Check if username already exists AND is verified
    const existingVerifiedUser = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingVerifiedUser) {
      return Response.json(
        {
          success: false,
          message: "Username already taken",
        },
        { status: 400 }
      );
    }

    // Everything OK
    return Response.json(
      {
        success: true,
        message: "Username is available",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking username:", error);
    return Response.json(
      {
        success: false,
        message: "Server error while checking username",
      },
      { status: 500 }
    );
  }
}
