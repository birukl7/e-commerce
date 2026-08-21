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
    return (
        <div className="w-full">
            <div className="grid h-auto grid-cols-1 gap-4 lg:h-[420px] lg:grid-cols-5">
                {/* Left - Dark forest block with text */}
                <div className="relative flex flex-col justify-center rounded-lg bg-[#2D3B2A] p-10 lg:col-span-2 lg:p-14">
                    <h1
                        className="mb-4 text-3xl font-bold leading-tight text-white lg:text-4xl"
                        style={{ fontFamily: "'Lora', Georgia, serif" }}
                    >
                        {settings?.banner_main_title || 'Discover unique, handcrafted treasures'}
                    </h1>
                    <p className="mb-8 text-base leading-relaxed text-[#D4CFC7]">
                        {settings?.banner_main_subtitle ||
                            'From Ethiopian artisans and creators you will love'}
                    </p>
                    <div>
                        <Link href={settings?.banner_main_button_link || '/categories'}>
                            <button className="rounded-full border-2 border-white bg-transparent px-7 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white hover:text-[#2D3B2A]">
                                {settings?.banner_main_button_text || 'Shop now'}
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Right - Product lifestyle image */}
                <div className="relative min-h-[280px] overflow-hidden rounded-lg lg:col-span-3 lg:min-h-full">
                    <img
                        src={settings?.banner_main_image || `image/image-3.jpg`}
                        alt={settings?.banner_main_title || 'Featured products'}
                        className="h-full w-full object-cover"
                    />
                    {/* Floating secondary promo card */}
                    <div className="absolute bottom-0 left-0 right-0 bg-[#2D3B2A]/70 p-5 backdrop-blur-sm lg:bottom-0 lg:left-auto lg:right-0 lg:w-72 lg:rounded-tl-lg lg:p-6">
                        <p
                            className="mb-1 text-lg font-semibold text-white"
                            style={{ fontFamily: "'Lora', Georgia, serif" }}
                        >
                            {settings?.banner_secondary_title || 'Gifts they will treasure'}
                        </p>
                        <Link
                            href={settings?.banner_secondary_button_link || '/categories'}
                            className="text-sm font-medium text-[#D4CFC7] underline underline-offset-2 transition-colors hover:text-white"
                        >
                            {settings?.banner_secondary_button_text || 'Shop gifts'}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
