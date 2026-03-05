import { Socials } from "@/constants";
import { Link } from "react-router-dom";

const Navbar = () => {
    return (
        <div className="w-full h-[65px] fixed top-0 shadow-lg shadow-[#2A0E61]/50 bg-[#03001417] backdrop-blur-md z-50 px-10">
            <div className="w-full h-full flex flex-row items-center justify-between m-auto px-[10px]">
                <a
                    href="/"
                    className="h-auto w-auto flex flex-row items-center"
                >
                    <img
                        src="/NavLogo.png"
                        alt="logo"
                        width={70}
                        height={70}
                        className="cursor-pointer hover:animate-slowspin"
                    />

                    <span className="font-bold ml-[10px] hidden md:block text-gray-300">
                        Data Labeling System
                    </span>
                </a>

                <div className="w-fit h-full flex flex-row items-center justify-between">
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <Link
                            to="/login"
                            className="px-[20px] py-[10px] bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full font-semibold tracking-widest shadow-[0_0_30px_rgba(139,92,246,0.6)] hover:shadow-[0_0_60px_rgba(217,70,239,0.8)] transition-all hover:scale-105 hover:bg-gradient-to-r hover:from-violet-500 hover:to-fuchsia-500 text-white uppercase animate-[pulse_3s_ease-in-out_infinite]"
                        >
                            Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Navbar;