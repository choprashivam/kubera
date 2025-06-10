import { PrismaAdapter } from "@auth/prisma-adapter";
import {
  getServerSession,
  type User,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import { type Adapter } from "next-auth/adapters";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from 'next-auth/providers/facebook';
// import TwitterProvider from 'next-auth/providers/twitter'; //We have currently disabled twitter ID provider as we could not integrate
import EmailProvider from "next-auth/providers/email";
import LinkedInProvider, { type LinkedInProfile } from "next-auth/providers/linkedin";
import nodemailer from "nodemailer";

import { env } from "~/env";
import { db } from "~/server/db";
import { getSessionToken } from "~/utils/getSessionToken";
import { cookies } from "next/headers";
import { ADMIN_DOMAIN } from "~/constants";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      isAdmin: boolean;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
    ifinId: string | null;
  }

  interface User {
    isAdmin: boolean;
  }
  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

// Define a custom profile type that extends OAuthProfile
interface P extends LinkedInProfile {
  sub?: string;
  name?: string;
  email?: string;
  picture?: string;
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    async session({ session, user }) {
      try {
        const sessionToken = getSessionToken(cookies().getAll());

        if (!user.email.endsWith(ADMIN_DOMAIN)) {
          // If not an admin, only make the db.session call
          if (sessionToken) {
            const data = await db.session.findUnique({
              where: { sessionToken },
              select: { ifinId: true },
            });
            session.ifinId = data?.ifinId ?? null;
          } else {
            session.ifinId = null;
          }

          return {
            ...session,
            user: {
              ...session.user,
              id: user.id,
              isAdmin: false,
            },
          };
        } else {
          // If it's an admin email, make both calls
          if (sessionToken) {
            const data = await db.session.findUnique({
              where: { sessionToken },
              select: { ifinId: true },
            });
            session.ifinId = data?.ifinId ?? null;
          } else {
            session.ifinId = null;
          }

          const result = await db.user.findFirst({
            where: { email: user.email },
            select: { isAdmin: true },
          });

          return {
            ...session,
            user: {
              ...session.user,
              id: user.id,
              isAdmin: result?.isAdmin ? true : false,
            },
          };
        }
      } catch (error) {
        console.error("Error in session callback:", error);
        return session;
      }
    },
    async signIn({ user /*, account, profile, email, credentials*/ }) {
      const userExists = await db.user.findUnique({ where: { email: user.email ?? "", }, });
      if (userExists) {
        return true
      } else {
        return false
      }
    },
    redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
      // console.log(url, baseUrl)
    },
  },
  session: {
    strategy: "database",
    maxAge: 12 * 60 * 60,
    updateAge: 60 * 60,
  },
  adapter: PrismaAdapter(db) as Adapter,
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    FacebookProvider({
      clientId: env.FACEBOOK_CLIENT_ID,
      clientSecret: env.FACEBOOK_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    // Disable twitter as of now
    // TwitterProvider({
    //   clientId: env.TWITTER_ID,
    //   clientSecret: env.TWITTER_SECRET,
    //   allowDangerousEmailAccountLinking: true,
    //   version: "1.0A"
    // }),
    LinkedInProvider({
      clientId: env.LINKEDIN_CLIENT_ID,
      clientSecret: env.LINKEDIN_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          scope: "openid profile email",
        },
      },
      issuer: "https://www.linkedin.com/oauth",
      jwks_endpoint: "https://www.linkedin.com/oauth/openid/jwks",
      async profile(profile: P): Promise<User> {
        // Check if the user exists in the database and get their isAdmin status
        const user = await db.user.findUnique({
          where: { email: profile.email },
          select: { isAdmin: true },
        });
        return {
          id: profile?.sub ?? "",
          name: profile?.name ?? "",
          email: profile?.email ?? "",
          image: profile?.picture ?? "",
          isAdmin: user?.isAdmin ? true : false,
        };
      },
    }),

    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,  // Uses alias
      async sendVerificationRequest({ identifier, url }) {
        const transporter = nodemailer.createTransport({
          host: process.env.EMAIL_SERVER_HOST,
          port: Number(process.env.EMAIL_SERVER_PORT),
          auth: {
            user: process.env.EMAIL_SERVER_USER,
            pass: process.env.EMAIL_SERVER_PASSWORD,
          },
        });

        const mailOptions = {
          from: process.env.EMAIL_FROM,  // Alias
          to: identifier,
          subject: "Your Secure Login Link to Access Your Wealth Portfolio",
          html: `
            <p>Hello,</p>
            <p>To access your wealth portfolio on the Kubera App, please click here:</p>
            <p>
              <a href="${url}" style="display: inline-block; padding: 10px 20px; background-color: #35a348; color: white; text-decoration: none; border-radius: 5px; font-size: 16px;">
                Access Your Portfolio
              </a>
            </p>
            <p>This link can only be used once.</p>
            <p>The iFinStrats Team</p>
          `,
        };

        // Log the URL to the console
        console.log(`Login URL for ${identifier}: ${url}`);

        try {
          await transporter.sendMail(mailOptions);
          console.log(`Verification email sent to ${identifier}`);
        } catch (error) {
          console.error("Error sending email:", error);
        }
      },
    }),

    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
  // debug:true, //To be enabled for debugging providers and any auth issues

  pages: {
    signIn: "/auth/signin",
  },

};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);