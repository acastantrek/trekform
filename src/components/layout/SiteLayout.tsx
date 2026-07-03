import { Outlet } from 'react-router-dom'
import { ScrollToTop } from '../common/ScrollToTop'
import { Footer } from './Footer'
import { Header } from './Header'
export function SiteLayout() { return <><ScrollToTop/><Header/><main><Outlet/></main><Footer/></> }
