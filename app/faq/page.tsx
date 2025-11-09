import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Info, ChevronDown } from 'lucide-react';
import Link from 'next/link';

export default function Page() {
  return (
    <>
      <div className="w-1 h-16" />
      <div className="flex flex-col items-center max-w-6xl mx-auto px-6 py-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-lg">This page lists answers to questions frequently asked by the community about Draconic ID. If your question is not in this list, feel free to <Link className="underline" target='_blank' href="https://mailhide.io/e/RPzCeWBk">contact us</Link>.</p>
        </div>
      </div>
      <div className="flex flex-col items-center max-w-4xl mx-auto px-6">
        <div className="w-full">
          <div className="space-y-4">
            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left bg-card hover:bg-accent rounded-lg border">
                <span className="text-lg font-semibold">Who is Draconic ID intended for?</span>
                <ChevronDown className="h-4 w-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="p-4 border-x border-b rounded-b-lg">
                <p className="text-lg leading-relaxed mb-4">Draconic ID is mainly aimed at dragonkin or anyone who has an identity as a dragon. With that said, we do not act as gatekeepers and we trust our users to invite people who would be a good fit.</p>
                <p className="text-lg leading-relaxed">However, a hard requirement is that you need to be a legal adult in your jurisdiction. This requirement exists not because Draconic ID contains adult content, but because we do not have the resources to comply with the additional laws that apply when handling data from minors. If you suspect someone on the platform is a minor, please contact us.</p>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left bg-card hover:bg-accent rounded-lg border">
                <span className="text-lg font-semibold">How did Draconic ID come to be?</span>
                <ChevronDown className="h-4 w-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="p-4 border-x border-b rounded-b-lg">
                <p className="text-lg leading-relaxed">The very first iteration of Draconic ID was called "Dragon Map", a website solely focused on providing a map with dragons and nothing more than that. Though a quick prototype was made, it never matured to the point where others could make use of it. Years later, I gave the idea another go in the form of Draconic ID, a website that would also incorporate customizable profiles and an account system that can be used on a variety of dragon-focused sites and applications. The original intent was to call it Dragon ID, as it would be a place where your dragon identity could shine. However, the domain I was eyeballing, "dragon.id", was taken and is still being renewed. As such, I eventually went for the name Draconic ID. Not only was the "draconic.id" domain name still available, it also felt somewhat more inclusive. It is also a nice nod to Draconic.com, one of the earliest dragonkin communities that has a similar map, although it is nowadays severely out of date technology-wise and information-wise.</p>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left bg-card hover:bg-accent rounded-lg border">
                <span className="text-lg font-semibold">Who is behind Draconic ID?</span>
                <ChevronDown className="h-4 w-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="p-4 border-x border-b rounded-b-lg">
                <p className="text-lg leading-relaxed">Yours truly, Bluefire. You can visit my <Link href="/profile/PkKltWOmS3dhUhUR" className="underline">Draconic ID profile</Link> or <Link href="https://bluefi.re" className="underline" target="_blank">website</Link> to learn more about me. I'm also featured in the site's logo. It was lovingly made by <Link href="/profile/d9VFY0DwvdI_nuHi" className="underline">Ven</Link>.</p>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left bg-card hover:bg-accent rounded-lg border">
                <span className="text-lg font-semibold">What am I allowed to put on my profile?</span>
                <ChevronDown className="h-4 w-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="p-4 border-x border-b rounded-b-lg">
                <p className="text-lg leading-relaxed">Anything! As long as it does not cause harm to anyone and is appropriate for all ages. This extends to your profile's metadata such as your name, tagline and profile picture. We also ask you to keep the content on your profile relevant. Please avoid placing random text or spam here. A full outline of what you are allowed to put on your profile can be found in the terms of use. If you found a profile containing inappropriate content, feel free to contact us.</p>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left bg-card hover:bg-accent rounded-lg border">
                <span className="text-lg font-semibold">I am afraid of exposing my location on the map.</span>
                <ChevronDown className="h-4 w-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="p-4 border-x border-b rounded-b-lg">
                <p className="text-lg leading-relaxed">The map is an iconic feature of Draconic ID. However, how and whether you want to be on the map is totally up to you. The aim is to give you a rough idea of where dragons might be. By no means should you expose your real address. When creating an account and making a profile, you can optionally choose the location of the pin on the map. The coordinates of this pin are the only thing we save about your location. You are free to make the location of this pin as precise or imprecise as you want. Furthermore, you can also choose to have your pin only be shown to dragons who are logged in. To achieve this, you must set your profile's privacy to "Hidden".</p>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left bg-card hover:bg-accent rounded-lg border">
                <span className="text-lg font-semibold">My map marker is getting covered up by others.</span>
                <ChevronDown className="h-4 w-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="p-4 border-x border-b rounded-b-lg">
                <p className="text-lg leading-relaxed">When multiple markers are placed close together on the map, some may appear on top of others. This is especially apparent in busy regions like Europe and North America when zoomed out. Which markers get rendered on top is determined randomly each time the data is retrieved. Profiles with an avatar get priority over profiles without an avatar, making them more likely to appear on top when markers overlap. Data might be cached, so refreshing the page does not always change the priority of the markers immediately.</p>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left bg-card hover:bg-accent rounded-lg border">
                <span className="text-lg font-semibold">Will my profile show up on Google (and other search engines)?</span>
                <ChevronDown className="h-4 w-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="p-4 border-x border-b rounded-b-lg">
                <p className="text-lg leading-relaxed">By default, the privacy setting of a profile is set to public. This means that search engines such as Google are allowed to index your profile and display it in their search results. We generally recommend keeping this setting as-is so others looking for you are able to find you. Only add information to your profile you don't mind being searchable on search engines. However, by setting your profile's privacy to unlisted, we explicitly tell search engines not to index your profile. This means that your profile will be hidden from search results. If your profile's privacy was set to unlisted only recently, it might still show up on search results until search engines notice your updated preferences.</p>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left bg-card hover:bg-accent rounded-lg border">
                <span className="text-lg font-semibold">Is information on my profile used for AI (artificial intelligence)?</span>
                <ChevronDown className="h-4 w-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="p-4 border-x border-b rounded-b-lg">
                <p className="text-lg leading-relaxed">We do not use data you have entered on your profile for the purpose of training or enhancing AI. We also employ technologies such as <Link href="https://developers.cloudflare.com/bots/additional-configurations/block-ai-bots" className="underline" target="_blank">AI bot blocking through Cloudflare</Link>. This limits the information third-party AI providers such as OpenAI, Google and Microsoft can retrieve.</p>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left bg-card hover:bg-accent rounded-lg border">
                <span className="text-lg font-semibold">What are your privacy policy and terms of use like?</span>
                <ChevronDown className="h-4 w-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="p-4 border-x border-b rounded-b-lg">
                <p className="text-lg leading-relaxed mb-4">Draconic ID is run by an individual without the intent to profit from it. As such, our privacy policy is quite simple. We have no interest in harvesting your information and selling it. Any data we hold onto is only with the purpose of providing you this service. Similarly, when it comes to the terms of use, we ask you not to abuse our service. Furthermore, uploading content to Draconic ID means you are permitting us to save, use and display this content. If you still want to know more, our privacy policy and terms of use can be downloaded below.</p>
                <ul className="list-disc text-lg list-inside space-y-2 ml-4">
                  <li><Link href="/Privacy%20Policy.odt" className="underline">Privacy Policy</Link> (can be opened with Word or LibreOffice)</li>
                  <li><Link href="/Terms%20of%20Use.odt" className="underline">Terms of Use</Link> (can be opened with Word or LibreOffice)</li>
                </ul>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left bg-card hover:bg-accent rounded-lg border">
                <span className="text-lg font-semibold">I can't open up the site at school or work.</span>
                <ChevronDown className="h-4 w-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="p-4 border-x border-b rounded-b-lg">
                <p className="text-lg leading-relaxed">If the site does not load while your device is connected to the network at your school or workplace, it is probably related to DNS. It is one of the ways in which these kinds of networks usually employ filters and website blocks. They often target less common top level domains such as ".id". This kind of block can usually be circumvented by setting up a DNS different from the one provided by the network. <Link href="https://www.dns0.eu" className="underline" target="_blank">DNS0.EU</Link> is an example of a free, privacy-friendly DNS provider. They provide setup instructions on their website. This usually comes with the benefit of speeding up website loading as well.</p>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left bg-card hover:bg-accent rounded-lg border">
                <span className="text-lg font-semibold">Will Draconic ID still be around in the far future?</span>
                <ChevronDown className="h-4 w-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="p-4 border-x border-b rounded-b-lg">
                <p className="text-lg leading-relaxed mb-4">Many dragon-related websites of the 90s and early 2000s have long since gone down. With them went the history of dragon communities. The internet was a new place for everyone, and the archival of all this valuable information was often overseen. As an address book of dragons around the globe, we employ several methods to keep your records safe and sound no matter what the future holds.</p>
                <Alert variant="default" className="mb-4">
                  <Info />
                  <AlertDescription className=''>
                    Please note that we respect your privacy under all circumstances. Hidden and private profiles or sensitive information stored in accounts such as e-mail addresses and passwords will never be publicly accessible through any means. We encourage users to set their profile privacy to public if they would like it to be preserved into the far future.
                  </AlertDescription>
                </Alert>
                <ul className="list-disc text-lg list-inside space-y-3 ml-4">
                  <li>We periodically create full back-ups which are stored on-site with redundancy and in the cloud. This allows us to restore the site if data loss ever were to occur. We use encryption to make sure third-parties are not able to read any of this data.</li>
                  <li>We make as much data as possible freely accessible through APIs. This means that anyone can easily export, back-up and use profiles. We use standard formats such as JSON and HTML. This ensures your information is never locked to our platform.</li>
                  <li>The website is open-source. In the future, you will be able to clone the code to host your own instance. Together with the API data and public archives, this can be used by anyone to pick up the torch if the original website ever were to go down.</li>
                  <li>The Internet Archive is a non-profit digital library that has been crucial to the archival dragon websites' and communities' history. We periodically supply them a list of all public profiles on Draconic ID. This allows them to create complete archives of all public profiles at different points in time. These archives are publicly accessible through the <Link href="https://web.archive.org" className="underline" target="_blank">Wayback Machine</Link> by supplying the URL.</li>
                </ul>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left bg-card hover:bg-accent rounded-lg border">
                <span className="text-lg font-semibold">I have feedback, a question, a concern or want to report a bug.</span>
                <ChevronDown className="h-4 w-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="p-4 border-x border-b rounded-b-lg">
                <p className="text-lg leading-relaxed">Feel free to reach out by sending us an <Link href="https://mailhide.io/e/RPzCeWBk" className="underline" target="_blank">e-mail</Link>. We promise we won't bite! We respond the same day on a best-effort basis. It should take a few days at most.</p>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </div>
    </>
  );
}