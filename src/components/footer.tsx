import React from 'react'
import Image from "next/image";
import VideoPlayer from './VedioPlayer';

const Footer = () => {
    return (
        <footer className="bg-[#F3F4F6] text-center py-6 pb-10">
            <div className="w-full bg-[#FEEFEA] rounded-lg px-4 py-10">
                <div className="flex flex-col md:flex-row items-center justify-between max-w-6xl mx-auto w-full">
                    {/* Left Section - Text */}
                    <div className="md:w-1/2 text-center md:text-left mb-8 md:mb-0">
                        <h2 className="text-[#F05A28] font-bold text-xl md:text-2xl mb-4">
                            BIKE SECURITY
                        </h2>
                        <p className="text-[#333] mb-4">
                            Lockstop makes bike security effortless—no bulky locks, no
                            hassle. Lockstop transforms existing bike racks into secure,
                            app-enabled locks. All you need is your phone. Let’s make
                            biking a safer, smarter choice for everyone.
                        </p>
                        <h3 className="text-[#F05A28] font-bold mt-6 mb-2">
                            GET THE APP
                        </h3>
                        <div className="flex justify-center md:justify-start gap-4">
                            <a
                                href="https://play.google.com/store/apps/details?id=com.lockstop.app"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Image
                                    src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                                    alt="Get it on Google Play"
                                    className="w-36"
                                    width={144}
                                    height={48}
                                />
                            </a>
                            <a
                                href="https://apps.apple.com/us/app/lockstop/id6503916752"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Image
                                    src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                                    alt="Download on the App Store"
                                    className="w-36"
                                    width={144}
                                    height={48}
                                />
                            </a>
                        </div>
                    </div>

                    {/* Right Section - Image */}
                    <div className="md:w-1/2">
                        <VideoPlayer src='https://video.wixstatic.com/video/d6a015_575e730ea1ce4b9a9fbd33e979253600/720p/mp4/file.mp4'/>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer