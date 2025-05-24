
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Wand2, Edit, History, Lightbulb, Users, CheckCircle, Linkedin, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import Image from 'next/image';
import { ThemeToggle } from '@/components/theme-toggle';
import { AnimatedBackground } from '@/components/animated-background';
import StylusTextAnimation from '@/components/stylus-text-animation';

export default function HomePage() {
  const features = [
    {
      icon: <Brain className="h-10 w-10 text-accent mb-3" />,
      title: "AI Wall Color Detection",
      description: "Upload a photo of your room, and our AI will intelligently identify the current colors of your walls.",
      hint: "ai technology"
    },
    {
      icon: <Wand2 className="h-10 w-10 text-accent mb-3" />,
      title: "Smart Color Palettes",
      description: "Receive AI-generated color palette suggestions that harmonize with your room's existing elements.",
      hint: "color palette"
    },
    {
      icon: <Edit className="h-10 w-10 text-accent mb-3" />,
      title: "Virtual Wall Repaint",
      description: "Visualize new paint colors directly on your room's photo with our AI-powered repaint feature.",
      hint: "virtual interior"
    },
    {
      icon: <History className="h-10 w-10 text-accent mb-3" />,
      title: "Project History",
      description: "Save your design projects, revisit your color choices, and track your creative journey.",
      hint: "design journal"
    }
  ];

  const galleryImages = [
    { src: "https://placehold.co/600x400.png", alt: "Elegant Living Room", hint: "living room elegant" },
    { src: "https://placehold.co/600x400.png", alt: "Serene Bedroom Oasis", hint: "bedroom serene" },
    { src: "https://placehold.co/600x400.png", alt: "Modern Minimalist Kitchen", hint: "kitchen modern" },
    { src: "https://placehold.co/600x400.png", alt: "Vibrant Home Office", hint: "office vibrant" },
    { src: "https://placehold.co/600x400.png", alt: "Cozy Reading Nook", hint: "reading nook cozy" },
    { src: "https://placehold.co/600x400.png", alt: "Chic Dining Area", hint: "dining chic" },
  ];

  const teamMembers = [
    {
      name: "Alex Mint",
      role: "Founder & CEO",
      bio: "Passionate about blending AI with creative design to build intuitive tools.",
      image: "https://placehold.co/300x300.png",
      hint: "person portrait",
      socials: {
        linkedin: "#",
        twitter: "#",
      },
    },
    {
      name: "Jamie Fire",
      role: "Lead Developer",
      bio: "Expert in full-stack development and bringing complex AI visions to life.",
      image: "https://placehold.co/300x300.png",
      hint: "person portrait",
      socials: {
        linkedin: "#",
        twitter: "#",
      },
    },
    {
      name: "Casey Design",
      role: "Head of UX/UI",
      bio: "Dedicated to crafting user-centric experiences that are both beautiful and functional.",
      image: "https://placehold.co/300x300.png",
      hint: "person portrait",
      socials: {
        linkedin: "#",
        twitter: "#",
      },
    },
  ];


  return (
    <>
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <div className="relative text-foreground overflow-hidden">
        <AnimatedBackground />
        
        {/* Hero Section */}
        <section className="relative flex flex-col items-center justify-center min-h-[calc(100vh-150px)] py-16 px-4 sm:px-8 text-center z-10">
          <StylusTextAnimation /> {/* Animated "La Interior" */}
          
          <p className="text-2xl text-muted-foreground mt-2 mb-8">
            by <span className="font-semibold text-primary">MintFire</span>
          </p>
          
          <p className="text-lg max-w-2xl mx-auto mb-10">
            Revolutionize your interior design process. La Interior leverages cutting-edge AI to help you detect wall colors, generate stunning palettes, and visualize transformations in your own space before you pick up a paintbrush.
          </p>

          <Button asChild size="lg" className="w-full sm:w-auto text-lg py-6 px-10 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-[1.03]">
            <Link href="/login">Sign In & Start Designing</Link>
          </Button>
          
          <p className="text-sm text-muted-foreground pt-8">
            Unlock your home's potential. It's simple, intuitive, and inspiring.
          </p>
        </section>

        {/* About Us Section */}
        <section className="py-16 px-4 sm:px-8 bg-background/70 backdrop-blur-sm z-10 relative">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4 text-primary">Discover La Interior</h2>
            <p className="text-lg max-w-3xl mx-auto text-muted-foreground mb-12">
              At MintFire, we believe that redesigning your space should be an exciting and accessible adventure. 
              La Interior was born from a passion for design and technology, aiming to empower homeowners and enthusiasts 
              with AI tools that simplify color choices and inspire creativity. Say goodbye to guesswork and hello to confident design decisions.
            </p>
            <div className="grid md:grid-cols-3 gap-8 text-left">
              <div className="space-y-2">
                <Lightbulb className="h-8 w-8 text-primary mb-2" />
                <h3 className="text-xl font-semibold">Innovative AI</h3>
                <p className="text-muted-foreground">Our advanced algorithms provide accurate color detection and relevant suggestions tailored to your space.</p>
              </div>
              <div className="space-y-2">
                <Users className="h-8 w-8 text-primary mb-2" />
                <h3 className="text-xl font-semibold">User-Focused</h3>
                <p className="text-muted-foreground">Designed with you in mind, La Interior offers an intuitive experience for seamless project creation.</p>
              </div>
              <div className="space-y-2">
                <CheckCircle className="h-8 w-8 text-primary mb-2" />
                <h3 className="text-xl font-semibold">Visualize with Confidence</h3>
                <p className="text-muted-foreground">See your ideas come to life with our virtual repaint feature, ensuring you love the result.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features Section */}
        <section className="py-16 px-4 sm:px-8 z-10 relative">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-primary">Transform Your Space with Powerful Features</h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <Card key={index} className="hover:shadow-xl transition-shadow duration-300 bg-card/80 backdrop-blur-sm">
                  <CardHeader className="items-center text-center">
                    {feature.icon}
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Inspiration Gallery Section */}
        <section className="py-16 px-4 sm:px-8 bg-background/70 backdrop-blur-sm z-10 relative">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-primary">Inspiration Gallery</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {galleryImages.map((img, idx) => (
                    <div key={idx} className="rounded-lg overflow-hidden shadow-lg aspect-video relative group border-2 border-primary/30 hover:border-primary transition-all duration-300">
                        <Image 
                            src={img.src} 
                            alt={img.alt} 
                            width={600} 
                            height={400} 
                            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                            data-ai-hint={img.hint}
                        />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <p className="text-white font-semibold text-lg">{img.alt}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="text-center mt-12">
              <Button asChild size="lg" className="text-lg py-3 px-8">
                <Link href="/login">Explore More in the App</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* MintFire Team Section */}
        <section className="py-16 px-4 sm:px-8 z-10 relative">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-primary">Meet the MintFire Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => (
                <Card key={index} className="text-center hover:shadow-xl transition-shadow duration-300 bg-card/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className="relative w-36 h-36 mx-auto mb-4 rounded-full overflow-hidden border-2 border-primary">
                      <Image 
                        src={member.image} 
                        alt={member.name} 
                        width={144} 
                        height={144} 
                        className="object-cover"
                        data-ai-hint={member.hint}
                      />
                    </div>
                    <CardTitle className="text-xl">{member.name}</CardTitle>
                    <CardDescription>{member.role}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">{member.bio}</p>
                  </CardContent>
                  <CardFooter className="flex justify-center gap-4 pt-4">
                    {member.socials.linkedin && (
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={member.socials.linkedin} target="_blank" rel="noopener noreferrer">
                          <Linkedin className="h-5 w-5 text-primary hover:text-primary/80" />
                        </Link>
                      </Button>
                    )}
                    {member.socials.twitter && (
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={member.socials.twitter} target="_blank" rel="noopener noreferrer">
                          <Twitter className="h-5 w-5 text-primary hover:text-primary/80" />
                        </Link>
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Us Section */}
        <section className="py-16 px-4 sm:px-8 bg-background/70 backdrop-blur-sm z-10 relative">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold text-center mb-8 text-primary">Get in Touch with MintFire</h2>
            <p className="text-lg max-w-2xl mx-auto text-muted-foreground mb-12">
              We&apos;d love to hear from you! Whether you have questions, feedback, or just want to say hello, feel free to reach out.
            </p>
            <div className="grid md:grid-cols-3 gap-8 text-left max-w-4xl mx-auto">
              <Card className="flex flex-col items-center p-6 bg-card/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
                <Mail className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Email Us</h3>
                <p className="text-muted-foreground hover:text-primary transition-colors">
                  <a href="mailto:hello@mintfire.dev">hello@mintfire.dev</a>
                </p>
              </Card>
              <Card className="flex flex-col items-center p-6 bg-card/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
                <Phone className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Call Us</h3>
                <p className="text-muted-foreground hover:text-primary transition-colors">
                  <a href="tel:+11234567890">(123) 456-7890</a>
                </p>
              </Card>
              <Card className="flex flex-col items-center p-6 bg-card/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
                <MapPin className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Our Office</h3>
                <p className="text-muted-foreground">
                  123 MintFire Street<br />Design City, DC 12345
                </p>
              </Card>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}

    