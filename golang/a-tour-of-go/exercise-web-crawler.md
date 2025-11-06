ref: https://go.dev/tour/concurrency/10
```
package main

import (
	"fmt"
	"sync"
)

var crawledUrlSet *SafeSet
func init() {
	crawledUrlSet = NewSafeSet()
}

type SafeSet struct {
	mu sync.Mutex
	data map[string]struct{}
}

func NewSafeSet() *SafeSet {
	return &SafeSet{data: make(map[string]struct{})}
}

func (s *SafeSet) AddIfNotContains(value string) bool {
	s.mu.Lock()
	defer s.mu.Unlock()
	_, exists := s.data[value]
	if exists {
		return false
	}
	
	s.data[value] = struct{}{}
	return true
}

type Fetcher interface {
	Fetch(url string) (body string, urls []string, err error)
}

func Crawl(url string, depth int, fetcher Fetcher) {
	if depth <= 0 {
		return
	}
	body, urls, err := fetcher.Fetch(url)
	if err != nil {
		fmt.Println(err)
		return
	}
	fmt.Printf("found: %s %q\n", url, body)
	for _, u := range urls {
		if !crawledUrlSet.AddIfNotContains(u) {
			continue
		}
		go Crawl(u, depth-1, fetcher)
	}
	return
}

func main() {
	Crawl("https://golang.org/", 4, fetcher)
	fmt.Println(crawledUrlSet)
}

type fakeFetcher map[string]*fakeResult

type fakeResult struct {
	body string
	urls []string
}

func (f fakeFetcher) Fetch(url string) (string, []string, error) {
	if res, ok := f[url]; ok {
		return res.body, res.urls, nil
	}
	return "", nil, fmt.Errorf("not found: %s", url)
}

// fetcher is a populated fakeFetcher.
var fetcher = fakeFetcher{
	"https://golang.org/": &fakeResult{
		"The Go Programming Language",
		[]string{
			"https://golang.org/pkg/",
			"https://golang.org/cmd/",
		},
	},
	"https://golang.org/pkg/": &fakeResult{
		"Packages",
		[]string{
			"https://golang.org/",
			"https://golang.org/cmd/",
			"https://golang.org/pkg/fmt/",
			"https://golang.org/pkg/os/",
		},
	},
	"https://golang.org/pkg/fmt/": &fakeResult{
		"Package fmt",
		[]string{
			"https://golang.org/",
			"https://golang.org/pkg/",
		},
	},
	"https://golang.org/pkg/os/": &fakeResult{
		"Package os",
		[]string{
			"https://golang.org/",
			"https://golang.org/pkg/",
		},
	},
}

```