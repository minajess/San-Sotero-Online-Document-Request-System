type Props = {
    className?: string;
};

export default function AppLogoIcon({ className }: Props) {
    return <img src="/brgyLogo.png" alt="Barangay San Sotero" className={className} />;
}
