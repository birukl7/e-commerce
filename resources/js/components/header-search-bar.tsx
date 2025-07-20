import { Button } from './ui/button'
import { Input } from './ui/input'
import { Search } from 'lucide-react'

const SearchBar = () => {
  return (
    <div className="relative w-full flex gap-10">
    <Input
      type="search"
      placeholder="Search For Everything"
      className="w-full pl-5 pr-4 py-3 pt-5 pb-5  rounded-full border-slate-200 focus:border-primary  border-black border-2 dark:bg-slate-900"
    />
    <Button className='absolute p-2 rounded-3xl bg-primary right-1  top-1/2 -translate-y-1/2'>
      <Search className=" h-5 w-5  text-white" />
    </Button>
  </div>
  )
}

export default SearchBar
