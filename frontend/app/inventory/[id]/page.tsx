import AssetDetailClient from './AssetDetailClient';

export function generateStaticParams() {
  return [];
}

type Props = { params: { id: string } };

export default function AssetDetailPage({ params }: Props) {
  return <AssetDetailClient id={params.id} />;
}
