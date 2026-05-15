import AssetDetailClient from './AssetDetailClient';

export function generateStaticParams() {
  return [];
}
export const dynamicParams = false;

type Props = { params: { id: string } };

export default function AssetDetailPage({ params }: Props) {
  return <AssetDetailClient id={params.id} />;
}
