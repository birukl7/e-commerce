import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import H1 from './ui/h1';
import H2 from './ui/h2';

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
        <div className="mx-auto w-full p-4">
            <div className="grid h-auto grid-cols-1 gap-4 lg:h-[400px] lg:grid-cols-2">
                {/* Back to School Section */}
                <div className="relative min-h-[300px] overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-50 to-primary-50 lg:min-h-full">
                    <div className="absolute inset-0">
                        <img
                            src={settings?.banner_main_image || `image/image-3.jpg`}
                            alt={settings?.banner_main_title || 'Banner image'}
                            className="w-full object-cover object-left"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-50/90 via-yellow-50/70 to-transparent" />
                    </div>

                    <div className="relative z-10 flex h-full flex-col justify-center p-8 lg:p-12">
                        <div className="max-w-md">
                            <H1 className="mb-3 text-4xl leading-tight font-bold text-gray-900 lg:text-5xl">
                                {settings?.banner_main_title || 'Back to school'}
                            </H1>
                            <p className="mb-8 text-lg font-medium text-gray-700 lg:text-xl">
                                {settings?.banner_main_subtitle || 'For the first day and beyond'}
                            </p>
                            <Link href={settings?.banner_main_button_link || '/categories'}>
                                <Button
                                    size="lg"
                                    className="rounded-full bg-gray-900 px-8 py-3 text-base font-semibold text-white transition-colors duration-200 hover:bg-gray-800"
                                >
                                    {settings?.banner_main_button_text || 'Shop school supplies'}
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Teacher Appreciation Gifts Section */}
                <div className="relative min-h-[300px] overflow-hidden rounded-2xl bg-gradient-to-br from-purple-200 to-purple-300 lg:min-h-full">
                    <div className="absolute inset-0">
                        <img
                            src={settings?.banner_secondary_image || `image/image-4.jpg`}
                            alt={settings?.banner_secondary_title || 'Secondary banner image'}
                            className="object-cover object-right"
                            sizes="(max-width: 1024px) 100vw, 50vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-l from-purple-400/80 via-purple-300/60 to-purple-200/40" />
                    </div>

                    <div className="relative z-10 flex h-full flex-col justify-end p-8 lg:p-12">
                        <div className="max-w-md">
                            <H2 className="mb-3 leading-tight">{settings?.banner_secondary_title || 'Teacher Appreciation Gifts'}</H2>
                            <Link href={settings?.banner_secondary_button_link || '/categories'}>
                                <button className="cursor-pointer text-left text-lg font-semibold text-black transition-all duration-200 hover:underline">
                                    {settings?.banner_secondary_button_text || 'Shop now'}
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
