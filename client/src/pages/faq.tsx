import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Search, MessageCircle, HelpCircle } from "lucide-react";
import type { FAQ } from "@shared/schema";

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: faqs, isLoading } = useQuery<FAQ[]>({
    queryKey: ['/api/faq'],
  });

  const filteredFaqs = faqs?.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const categories = Array.from(new Set(faqs?.map(f => f.category) || []));

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex p-4 rounded-full bg-primary/20 mb-4">
            <HelpCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Frequently Asked Questions</h1>
          <p className="text-muted-foreground">Find answers to common questions about IntentX</p>
        </div>

        {/* Search */}
        <Card className="p-4 bg-card border-card-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-faq"
            />
          </div>
        </Card>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge key={category} variant="outline" className="cursor-pointer hover-elevate" data-testid={`badge-category-${category.toLowerCase()}`}>
                {category}
              </Badge>
            ))}
          </div>
        )}

        {/* FAQ List */}
        <Card className="bg-card border-card-border overflow-hidden" data-testid="faq-list">
          {isLoading ? (
            <div className="divide-y divide-border">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="p-6 space-y-3 animate-pulse">
                  <div className="h-5 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/4" />
                </div>
              ))}
            </div>
          ) : filteredFaqs.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {filteredFaqs.map((faq, idx) => (
                <AccordionItem key={faq.id} value={faq.id} className="border-border px-6">
                  <AccordionTrigger className="text-left hover:no-underline" data-testid={`faq-question-${idx}`}>
                    <div className="flex items-start gap-3 pr-4">
                      <MessageCircle className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{faq.question}</p>
                        <Badge variant="secondary" className="mt-2 text-xs">
                          {faq.category}
                        </Badge>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pl-8 pr-4 pb-4 text-muted-foreground">
                      {faq.answer}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="p-12 text-center">
              <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">
                {searchQuery ? "No FAQs match your search" : "No FAQs available"}
              </p>
            </div>
          )}
        </Card>

        {/* Contact Card */}
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <div className="text-center space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Still have questions?</h3>
            <p className="text-sm text-muted-foreground">
              Join our Discord community or reach out to our support team
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <Badge variant="outline" className="cursor-pointer hover-elevate" data-testid="link-discord">Discord</Badge>
              <Badge variant="outline" className="cursor-pointer hover-elevate" data-testid="link-twitter">Twitter</Badge>
              <Badge variant="outline" className="cursor-pointer hover-elevate" data-testid="link-docs">Docs</Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
