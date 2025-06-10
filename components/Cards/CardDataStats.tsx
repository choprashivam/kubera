"use client";
import React, { useState } from "react";

interface CardDataStatsProps {
  title: string;
  total: string;
  rate?: string;
  levelUp?: boolean;
  levelDown?: boolean;
  info?: string;
}

const CardDataStats: React.FC<CardDataStatsProps> = ({
  title,
  total,
  rate,
  levelUp,
  levelDown,
  info
}) => {
  const [showInfo, setShowInfo] = useState(false);

  const handleClick = () => {
    setShowInfo(!showInfo);
  };

  return (
    <div
      className="rounded-sm border cursor-pointer preserve-3d transition-transform duration-500 border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark"
      style={{ transform: showInfo ? 'rotateY(180deg)' : 'rotateY(0)' }}
      onClick={handleClick}
    >

      {showInfo ? (
        <div className="min-h-[60px] flex items-center rotate-y-180">
          <p className="text-sm text-black dark:text-white">
            {info}
          </p>
        </div>
      ) : (
        <>
          <div>
            <h4 className="text-sm font-medium pb-8">
              {title}
            </h4>
          </div>

          <div className="flex items-end justify-between">
            <span className="text-title-md text-black dark:text-white">
              {total.split(' ').map((part, index) => (
                <React.Fragment key={index}>
                  {index === 0 ? (
                    <span className="font-normal">{part} </span>
                  ) : (
                    <span className="font-bold">{part}</span>
                  )}
                </React.Fragment>
              ))}
            </span>

            <span
              className={`flex items-center gap-1 text-sm font-medium ${levelUp && "text-meta-3"
                } ${levelDown && "text-meta-5"} `}
            >
              {rate}

              {levelUp && (
                <svg
                  className="fill-meta-3"
                  width="10"
                  height="11"
                  viewBox="0 0 10 11"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4.35716 2.47737L0.908974 5.82987L5.0443e-07 4.94612L5 0.0848689L10 4.94612L9.09103 5.82987L5.64284 2.47737L5.64284 10.0849L4.35716 10.0849L4.35716 2.47737Z"
                    fill=""
                  />
                </svg>
              )}
              {levelDown && (
                <svg
                  className="fill-meta-5"
                  width="10"
                  height="11"
                  viewBox="0 0 10 11"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5.64284 7.69237L9.09102 4.33987L10 5.22362L5 10.0849L-8.98488e-07 5.22362L0.908973 4.33987L4.35716 7.69237L4.35716 0.0848701L5.64284 0.0848704L5.64284 7.69237Z"
                    fill=""
                  />
                </svg>
              )}
            </span>
          </div>
        </>
      )}
    </div>
  )
}

export default CardDataStats;