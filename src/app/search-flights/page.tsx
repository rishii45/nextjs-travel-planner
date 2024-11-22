"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button, Input, Listbox, ListboxItem } from "@nextui-org/react";
import { FaCalendarAlt, FaSearch } from "react-icons/fa";
import { cityAirportCode } from "@/utils/city-airport-codes";
import { USER_API_ROUTES } from "@/utils/api-routes";
import axios from "axios";
import { useAppStore } from "@/store";

const SearchFlights = () => {
  const router = useRouter();
  const {setScraping, setScrapingType, setScrappedFlights} = useAppStore();

  const [loadingJobId, setLoadingJobId] = useState<number|undefined>(undefined)
  const [source, setSource] = useState("");
  const [sourceOptions, setSourceOptions] = useState<
    { city: string; code: string }[]
  >([]);
  const [destination, setDestination] = useState("");
  const [destinationOptions, setDestinationOptions] = useState<
    { city: string; code: string }[]
  >([]);

  const [flightDate, setFlightDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [cities, setCities] = useState([]);

  const handleSourceChange = (query: string) => {
    const lowerCaseQuery = query.toLocaleLowerCase();

    const matchingCities = Object.entries(cityAirportCode)
      .filter(([, city]) => city.toLocaleLowerCase().includes(lowerCaseQuery))
      .map(([code, city]) => ({ code, city }))
      .splice(0, 5);

    setSourceOptions(matchingCities);
  };

  const handleDestinationChange = (query: string) => {
    const lowerCaseQuery = query.toLocaleLowerCase();

    const matchingCities = Object.entries(cityAirportCode)
      .filter(([, city]) => city.toLocaleLowerCase().includes(lowerCaseQuery))
      .map(([code, city]) => ({ code, city }))
      .splice(0, 5);

    setDestinationOptions(matchingCities);
  };

  const startScraping = async () => {
    if (source && destination && flightDate) {
      const data = await axios.get(
        `${USER_API_ROUTES.FLIGHT_SCRAPE}?source=${source}&destination=${destination}&date=${flightDate}`
      );
      if (data.data.id) {
        setLoadingJobId(data.data.id);
        setScraping(true);
        setScrapingType("flight");
      }
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jobIntervalRef = useRef<any>(undefined);

  useEffect(() => {
    if (loadingJobId) {
      const checkIfJobCompleted = async () => {
        try {
          const response = await axios.get(
            `${USER_API_ROUTES.FLIGHT_SCRAPE_STATUS}?jobId=${loadingJobId}`
          );

          if (response.data.status) {
            setScrappedFlights(response.data.flights);
            // setFlightsDate()
            clearInterval(jobIntervalRef.current);
            setScraping(false);
            setScrapingType(undefined);
            router.push(`/flights?date=${flightDate}`);
          }
        } catch (err) {
          console.log({ err });
        }
      };

      const interval = setInterval(() => checkIfJobCompleted(), 3000);
      jobIntervalRef.current = interval;
    }

    return () => {
      if (jobIntervalRef.current) clearInterval(jobIntervalRef.current);
    };
  }, [
    // flightDate,
    loadingJobId,
    // router,
    // setScraping,
    // setScrapingType,
    // setScrappedFlights,
  ]);

  return (
    <div className="h-[90vh] flex items-center justify-center">
      <div className=" absolute left-0 top-0 h-[100vh] w-[100vw] max-w-[100vw] overflow-hidden overflow-x-hidden">
        <Image src="/flight-search.png" fill alt="Search" />
      </div>
      <div className="absolute h-[50vh] w-[60vw] flex flex-col gap-5">
        <div className="text-white text-center flex flex-col gap-5">
          <h3 className="text-xl font-bold">
            Best Flights made for you in mind!
          </h3>
          <h2 className="text-6xl font-extrabold">Explore the exotic world.</h2>
        </div>
        <div className="grid grid-cols-3 gap-5  px-10 items-center justify-center">
          <div className="relative">
            <Input
              color="danger"
              variant="bordered"
              className="text-white placeholder:text-white relative input-white"
              startContent={<FaSearch size={18} />}
              value={source}
              onChange={(e) => {
                setSource(e.target.value);
                handleSourceChange(e.target.value);
              }}
              placeholder="Source"
              classNames={{
                input: ["placeholder:text-white"],
              }}
            />
            {sourceOptions.length > 0 && (
              <div className="w-full min-h-[200px] max-w-[303px] border-small  rounded-small border-default-200  mt-5 absolute top-15 z-20">
                <div
                  className="bg-cover bg-center bg-no-repeat relative min-h-[200px] h-full w-full px-1 py-2 rounded-small"
                  style={{
                    backgroundImage: 'url("/home/home-bg.png")',
                  }}
                >
                  <div className="absolute inset-0 bg-black bg-opacity-10 backdrop-blur-md rounded-small"></div>
                  <Listbox
                    aria-label="Actions"
                    onAction={(key) => {
                      setSource(key as string);
                      setSourceOptions([]);
                    }}
                    className="rounded-small"
                  >
                    {sourceOptions.map(({ city, code }) => (
                      <ListboxItem
                        key={code}
                        color="danger"
                        className="text-white "
                      >
                        {city}
                      </ListboxItem>
                    ))}
                  </Listbox>
                </div>
              </div>
            )}
          </div>
          <div className="relative">
            <Input
              color="danger"
              variant="bordered"
              className="text-white placeholder:text-white relative input-white"
              startContent={<FaSearch size={18} />}
              value={destination}
              onChange={(e) => {
                setDestination(e.target.value);
                handleDestinationChange(e.target.value);
              }}
              placeholder="Destination"
              classNames={{
                input: ["placeholder:text-white"],
              }}
            />
            {destinationOptions.length > 0 && (
              <div className="w-full min-h-[200px] max-w-[303px] border-small  rounded-small border-default-200  mt-5 absolute top-15 z-20">
                <div
                  className="bg-cover bg-center bg-no-repeat relative min-h-[200px] h-full w-full px-1 py-2 rounded-small"
                  style={{
                    backgroundImage: 'url("/home/home-bg.png")',
                  }}
                >
                  <div className="absolute inset-0 bg-black bg-opacity-10 backdrop-blur-md rounded-small"></div>
                  <Listbox
                    aria-label="Actions"
                    onAction={(key) => {
                      setDestination(key as string);
                      setDestinationOptions([]);
                    }}
                    className="rounded-small"
                  >
                    {destinationOptions.map(({ city, code }) => (
                      <ListboxItem
                        key={code}
                        color="danger"
                        className="text-white "
                      >
                        {city}
                      </ListboxItem>
                    ))}
                  </Listbox>
                </div>
              </div>
            )}
          </div>
          <Input
            type="date"
            placeholder="Dates"
            variant="bordered"
            color="danger"
            className="text-white input-white placeholder:text-white accent-danger-500"
            startContent={<FaCalendarAlt />}
            value={flightDate}
            onChange={(e) => setFlightDate(e.target.value)}
          />
        </div>
        <Button
            size="lg"
            className="w-full cursor-pointer"
            color="danger"
            variant="shadow"
            onClick={startScraping}
          >
            Search
          </Button>
      </div>
    </div>
  );
};

export default SearchFlights;
