import dynamic from 'next/dynamic'

export const RichTextEditor = dynamic(
  () => import('./RichTextEditor').then((mod) => mod.RichTextEditor),
  {
    ssr: false,
    loading: () => <div>Loading editor...</div>
  }
)