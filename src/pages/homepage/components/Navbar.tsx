import { BrandLogo } from "@/components/common/BrandLogo";
import { Socials } from "@/constants";
import { Link } from "react-router-dom";

const Navbar = () => {
    return (
        <div className="w-full h-[65px] fixed top-0 shadow-lg shadow-[#2A0E61]/50 bg-[#03001417] backdrop-blur-md z-50 px-10">
            <div className="w-full h-full flex flex-row items-center justify-between m-auto px-[10px]">
                <BrandLogo />

                <div className="w-fit h-full flex flex-row items-center justify-between">
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <Link
                            to="/login"
                            className="px-[20px] py-[10px] bg-gradient-to-r from-violet-400 to-cyan-400 rounded-full font-semibold tracking-widest shadow-[0_0_30px_rgba(139,92,246,0.6)] hover:shadow-[0_0_60px_rgba(217,70,239,0.8)] transition-all text-white"
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