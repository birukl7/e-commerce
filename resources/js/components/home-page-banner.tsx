import { Link } from '@inertiajs/react';

interface HomePageBannerProps {
    settings?: {
        banner_main_title?: string;
        banner_main_subtitle?: string;
        banner_main_button_text?: string;
        banner_main_button_link?: string;
        banner_main_image?: string;
        banner_secondary_title?: string;
        banner_secondary_button_text?: string;
        banner_secondary_button_link?: string;
        banner_secondary_image?: string;
    };
}

export default function HomePageBanner({ settings }: HomePageBannerProps) {
    const mainImage = settings?.banner_main_image || '/image/image-3.jpg';
    const secondaryImage = settings?.banner_secondary_image || '/image/image-4.jpg';

    return (
        <div className="w-full">
            <div className="grid h-auto grid-cols-1 gap-4 lg:h-[420px] lg:grid-cols-5">
                {/* Left Side: Primary Banner */}
                <div className="group relative min-h-[340px] overflow-hidden rounded-2xl shadow-md lg:col-span-3 lg:min-h-full">
                    {/* Primary Banner Image */}
                    <img
                        src={mainImage}
                        alt={settings?.banner_main_title || 'Primary Banner'}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />

                    {/* Dark gradient overlay for readability */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#1E271C]/90 via-[#2D3B2A]/75 to-transparent" />

                    {/* Content */}
                    <div className="relative z-10 flex h-full flex-col justify-center p-8 lg:p-12 max-w-xl">
                        <h1
                            className="mb-4 text-3xl font-bold leading-tight text-white lg:text-4xl drop-shadow-sm"
                            style={{ fontFamily: "'Lora', Georgia, serif" }}
                        >
                            {settings?.banner_main_title || 'Discover unique, handcrafted treasures'}
                        </h1>
                        <p className="mb-8 text-base leading-relaxed text-[#E2DDD5]">
                            {settings?.banner_main_subtitle ||
                                'From Ethiopian artisans and creators you will love'}
                        </p>
                        <div>
                            <Link href={settings?.banner_main_button_link || '/categories'}>
                                <button className="rounded-full border-2 border-white bg-white/10 backdrop-blur-xs px-7 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-white hover:text-[#2D3B2A] hover:shadow-lg cursor-pointer">
                                    {settings?.banner_main_button_text || 'Shop now'}
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Right Side: Secondary Banner */}
                <div className="group relative min-h-[260px] overflow-hidden rounded-2xl shadow-md lg:col-span-2 lg:min-h-full">
                    {/* Secondary Banner Image */}
                    <img
                        src={secondaryImage}
                        alt={settings?.banner_secondary_title || 'Secondary Banner'}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />

                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1E271C]/90 via-[#2D3B2A]/60 to-black/20" />

                    {/* Content */}
                    <div className="relative z-10 flex h-full flex-col justify-end p-8 lg:p-10">
                        <h2
                            className="mb-4 text-2xl font-bold leading-snug text-white drop-shadow-sm"
                            style={{ fontFamily: "'Lora', Georgia, serif" }}
                        >
                            {settings?.banner_secondary_title || 'Gifts they will treasure'}
                        </h2>
                        <div>
                            <Link href={settings?.banner_secondary_button_link || '/categories'}>
                                <button className="rounded-full border-2 border-white/90 bg-white/10 backdrop-blur-xs px-6 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-white hover:text-[#2D3B2A] hover:shadow-md cursor-pointer">
                                    {settings?.banner_secondary_button_text || 'Shop gifts'}
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
