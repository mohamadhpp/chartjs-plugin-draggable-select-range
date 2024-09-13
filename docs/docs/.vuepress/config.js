import { defaultTheme } from '@vuepress/theme-default'
import { defineUserConfig } from 'vuepress/cli'
import { viteBundler } from '@vuepress/bundler-vite'

export default defineUserConfig({
    lang: 'en-US',

    title: 'Draggable Select Range Plugin | Chart.js',
    description: 'A ChartJS select range plugin for Line charts. It select a range of chart from X axis',

    head:
    [
        [
            'link',
            { rel: 'icon', href: 'logo.svg' }
        ]
    ],

    theme: defaultTheme({
        logo: 'logo.svg',

        navbar: ['/', '/Introduction'],
    }),

    bundler: viteBundler(),
});