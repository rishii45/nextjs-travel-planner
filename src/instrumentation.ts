import { Browser } from "puppeteer";
import {
  startHotelScraping,
  startLocationScraping,
  startPackageScraping,
} from "./scraping";
import { startFlightScraping } from "./scraping/flights-scraping";

export const register = async () => {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { Worker } = await import("bullmq");
    const { connection, jobsQueue, prisma } = await import("@/lib");
    const puppeteer = await import("puppeteer");
    const SBR_WS_ENDPOINT =
      "wss://brd-customer-hl_86c51cc0-zone-scraping_browser1:ytr2bos3h3k0@brd.superproxy.io:9222";

    new Worker(
      "jobsQueue",
      async (job) => {
        let browser: undefined | Browser = undefined;
        try {
          const admin = await prisma.admin.count();
          if (!admin) {
            const data = await prisma.admin.create({
              data: {
                email: "admin@travlyte.com",
                password:
                  "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918",
              },
            });
          }
          browser = await puppeteer.connect({
            browserWSEndpoint: SBR_WS_ENDPOINT,
          });
          const page = await browser.newPage();

          console.log("Connected! Navigating to" + job.data.url);
          await page.goto(job.data.url, { timeout: 60000 });
          console.log("Navigated! Scraping page content...");
          if (job.data.jobType.type === "location") {
            const packages = await startLocationScraping(page);
            await prisma.jobs.update({
              where: { id: job.data.id },
              data: { isComplete: true, status: "complete" },
            });
            for (const pkg of packages) {
              const jobCreated = await prisma.jobs.findFirst({
                where: {
                  url: `https://packages.yatra.com/holidays/intl/details.htm?packageId=${pkg?.id}`,
                },
              });
              if (!jobCreated) {
                const job = await prisma.jobs.create({
                  data: {
                    url: `https://packages.yatra.com/holidays/intl/details.htm?packageId=${pkg?.id}`,
                    jobType: { type: "package" },
                  },
                });
                jobsQueue.add("package", { ...job, packageDetails: pkg });
              }
            }
          } else if (job.data.jobType.type === "package") {
            //Already Scrapped Check
            const alreadyScrapped = await prisma.trips.findUnique({
              where: { id: job.data.packageDetails.id },
            });
            if (!alreadyScrapped) {
              console.log("Connected! Navigating to " + job.data.url);
              await page.goto(job.data.url, { timeout: 120000 });
              console.log("Navigated! Scraping page content...");
              const pkg = await startPackageScraping(
                page,
                job.data.packageDetails
              );
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              await prisma.trips.create({ data: pkg });
              await prisma.jobs.update({
                where: { id: job.data.id },
                data: { isComplete: true, status: "complete" },
              });
            }
          } else if (job.data.jobType.type === "flight") {
            console.log("in flight scraping");
            console.log("Connected! Navigating to " + job.data.url);

            await page.goto(job.data.url, { timeout: 120000 });

            console.log("Navigated! Scraping page content...");

            const flights = await startFlightScraping(page);

            await prisma.jobs.update({
              where: { id: job.data.id },
              data: { isComplete: true, status: "complete" },
            });

            for (const flight of flights) {
              await prisma.flights.create({
                data: {
                  name: flight.airlineName,
                  logo: flight.airlineLogo,
                  from: job.data.jobType.source,
                  to: job.data.jobType.destination,
                  departureTime: flight.departureTime,
                  arrivalTime: flight.arrivalTime,
                  duration: flight.flightDuration,
                  price: flight.price,
                  jobId: job.data.id,
                },
              });
            }
          } else if (job.data.jobType.type === "hotels") {
            console.log("Connected! Navigating to " + job.data.url);
            await page.goto(job.data.url, { timeout: 120000 });
            console.log("Navigated! Scraping page content...");
            const hotels = await startHotelScraping(
              page,
              browser,
              job.data.jobType.location
            );

            console.log(`Scraping Complete, ${hotels.length} hotels found.`);

            await prisma.jobs.update({
              where: { id: job.data.id },
              data: { isComplete: true, status: "complete" },
            });

            console.log("Job Marked as complete.");
            console.log("Starting Loop for Hotels");
            for (const hotel of hotels) {
              await prisma.hotels.create({
                data: {
                  name: hotel.title,
                  image: hotel.photo,
                  price: hotel.price,
                  jobId: job.data.id,
                  location: job.data.jobType.location.toLowerCase(),
                },
              });
              console.log(`${hotel.title} inserted in DB.`);
            }
            console.log("COMPLETE.");
          }
        } catch (error) {
          console.log(error);
          await prisma.jobs.update({
            where: { id: job.data.id },
            data: { isComplete: true, status: "failed" },
          });
        } finally {
          await browser?.close();
          console.log("Browser closed successfully");
        }
      },
      {
        connection,
        concurrency: 10,
        removeOnComplete: { count: 1000 },
        removeOnFail: { count: 5000 },
      }
    );
  }
};
