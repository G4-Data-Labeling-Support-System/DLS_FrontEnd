import { ArrowRightOutlined, GithubFilled } from "@ant-design/icons";
import { Link } from "react-router-dom";
import Features from "./Features";

export default function Hero() {
    return (
        <div className="">
            <div className="absolute top-0 z-[2] h-screen w-screen bg-[#000000] bg-[radial-gradient(#ffffff33_1px,#00091d_1px)] bg-[size:20px_20px]"></div>
            <section className="flex items-center justify-center w-full">
                <div className={`relative z-10 text-center`}>
                    <div className="relative w-full max-w-1xl mx-auto mt-40 mb-40 flex justify-center">
                        <div className="">
                            <h1 className="font-inter text-6xl font-normal mb-10 max-w-3xl mx-auto">
                                Redefining AI precision, <br></br>
                                <span className="bg-gradient-to-r from-violet-300 via-violet-500 to-cyan-200 bg-clip-text text-transparent">with data labeling sytem</span>
                            </h1>
                            <p className={`text-lg text-white mb-12 max-w-2xl mx-auto font-normal tracking-wide leading-relaxed`}>
                                The next evolution of data annotation. Immersive architectures
                                designed for quantum-level quality control and global scalability.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-6 justify-center">
                                <Link
                                    to="/login"
                                    className="px-4 py-2 flex gap-2 justify-center !bg-white !text-black rounded-lg font-medium font-inter"
                                >
                                    Get started 
                                    <ArrowRightOutlined width={1} height={1} />
                                </Link>

                                <Link
                                    to="https://github.com/G4-Data-Labeling-Support-System"
                                    className="px-4 py-2 flex gap-2 justify-center !bg-gray-800 !text-white rounded-lg font-medium font-inter"
                                >
                                    Go to github
                                    <GithubFilled width={1} height={1} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Features />
        </div>
    )
};
