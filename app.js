const { useState, useEffect, useRef } = React;
const { createRoot } = ReactDOM;

// CartoonForm Component
const CartoonForm = ({ onSubmit, isLoading }) => {
    const [theme, setTheme] = useState('');
    const [style, setStyle] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!theme.trim()) {
            setError('Please enter a theme');
            return;
        }
        
        setError('');
        onSubmit({ theme, style });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label htmlFor="theme">Cartoon Theme:</label>
                <input 
                    type="text" 
                    id="theme" 
                    value={theme} 
                    onChange={(e) => setTheme(e.target.value)}
                    placeholder="e.g., space adventure, underwater world"
                    disabled={isLoading}
                />
            </div>
            
            <div className="form-group">
                <label htmlFor="style">Art Style (optional):</label>
                <input 
                    type="text" 
                    id="style" 
                    value={style} 
                    onChange={(e) => setStyle(e.target.value)}
                    placeholder="e.g., anime, pixar, watercolor"
                    disabled={isLoading}
                />
            </div>
            
            {error && <p className="error-message">{error}</p>}
            
            <button type="submit" disabled={isLoading}>
                {isLoading ? 'Generating...' : 'Generate Cartoon'}
            </button>
        </form>
    );
};

// CartoonCard Component
const CartoonCard = ({ cartoon }) => {
    return (
        <div className="cartoon-card">
            <img 
                src={cartoon.imageUrl} 
                alt={cartoon.title} 
                className="cartoon-image"
                loading="lazy"
            />
            <div className="cartoon-content">
                <h3 className="cartoon-title">{cartoon.title}</h3>
                <p className="cartoon-description">{cartoon.description}</p>
                <div className="cartoon-meta">
                    <div className="user-info">
                        <img 
                            src={`https://images.websim.ai/avatar/${cartoon.username}`} 
                            alt={cartoon.username} 
                            className="user-avatar" 
                        />
                        {cartoon.username}
                    </div>
                    <span>{new Date(cartoon.created_at).toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
};

// CartoonGallery Component
const CartoonGallery = ({ cartoons, isLoading }) => {
    if (isLoading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
                <p>Loading cartoons...</p>
            </div>
        );
    }

    if (cartoons.length === 0) {
        return (
            <div className="empty-gallery">
                <svg viewBox="0 0 24 24">
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                </svg>
                <p>No cartoons yet. Be the first to create one!</p>
            </div>
        );
    }

    return (
        <div className="gallery">
            {cartoons.map((cartoon) => (
                <CartoonCard key={cartoon.id} cartoon={cartoon} />
            ))}
        </div>
    );
};

// Slideshow Component
const Slideshow = ({ cartoons }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const intervalRef = useRef(null);

    useEffect(() => {
        const handleSlideshowStart = () => setIsPlaying(true);
        const handleSlideshowStop = () => setIsPlaying(false);
        const handleSlideshowNext = () => {
            setCurrentIndex(prevIndex => {
                const newIndex = prevIndex + 1;
                return newIndex >= cartoons.length ? 0 : newIndex;
            });
        };

        window.addEventListener('slideshow_start', handleSlideshowStart);
        window.addEventListener('slideshow_stop', handleSlideshowStop);
        window.addEventListener('slideshow_next', handleSlideshowNext);

        return () => {
            window.removeEventListener('slideshow_start', handleSlideshowStart);
            window.removeEventListener('slideshow_stop', handleSlideshowStop);
            window.removeEventListener('slideshow_next', handleSlideshowNext);
        };
    }, []);

    useEffect(() => {
        if (isPlaying) {
            intervalRef.current = setInterval(() => {
                nextSlide();
            }, 5000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [isPlaying, cartoons.length]);

    const startSlideshowHandler = () => {
        startSlideshow();
        setIsPlaying(true);
    };

    const stopSlideshowHandler = () => {
        stopSlideshow();
        setIsPlaying(false);
    };

    const nextSlideHandler = () => {
        nextSlide();
    };

    if (cartoons.length === 0) {
        return null;
    }

    const currentCartoon = cartoons[currentIndex];

    return (
        <div className="slideshow-container">
            <h2>Slideshow Mode</h2>
            {currentCartoon && (
                <CartoonCard cartoon={currentCartoon} />
            )}
            <div className="slideshow-controls">
                {!isPlaying ? (
                    <button 
                        onClick={startSlideshowHandler} 
                        className="slideshow-btn"
                    >
                        Start Slideshow
                    </button>
                ) : (
                    <button 
                        onClick={stopSlideshowHandler} 
                        className="slideshow-btn"
                    >
                        Stop Slideshow
                    </button>
                )}
                <button 
                    onClick={nextSlideHandler} 
                    className="slideshow-btn"
                    disabled={cartoons.length <= 1}
                >
                    Next Slide
                </button>
            </div>
        </div>
    );
};

// Main App Component
const App = () => {
    const [cartoons, setCartoons] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        const unsub = subscribeToCartoons((updatedCartoons) => {
            // Sort cartoons by creation date (newest first)
            const sortedCartoons = [...updatedCartoons].sort((a, b) => 
                new Date(b.created_at) - new Date(a.created_at)
            );
            setCartoons(sortedCartoons);
            setIsLoading(false);
        });

        return () => unsub();
    }, []);

    const handleGenerateCartoon = async (formData) => {
        try {
            setIsGenerating(true);
            
            // Generate cartoon text content
            const cartoonData = await generateCartoonText(formData.theme, formData.style);
            
            // Generate cartoon image based on the prompt
            const imageUrl = await generateCartoonImage(cartoonData.prompt, formData.style);
            
            // Store in database
            await createCartoon({
                title: cartoonData.title,
                description: cartoonData.description,
                prompt: cartoonData.prompt,
                theme: formData.theme,
                style: formData.style || "standard",
                imageUrl: imageUrl
            });
            
            setIsGenerating(false);
        } catch (error) {
            console.error("Error in cartoon generation:", error);
            setIsGenerating(false);
            alert(`Error: ${error.message}`);
        }
    };

    return (
        <div className="app-container">
            <header className="header">
                <h1>This Slideshow Cartoon Does Not Exist</h1>
                <p>Generate unique cartoon slides and view them in a collaborative gallery</p>
            </header>
            
            <div className="main-content">
                <aside className="generator-panel">
                    <h2>Create New Cartoon</h2>
                    <CartoonForm 
                        onSubmit={handleGenerateCartoon} 
                        isLoading={isGenerating}
                    />
                    
                    {cartoons.length > 0 && (
                        <Slideshow cartoons={cartoons} />
                    )}
                </aside>
                
                <main className="gallery-panel">
                    <h2>Cartoon Gallery</h2>
                    <CartoonGallery 
                        cartoons={cartoons} 
                        isLoading={isLoading && cartoons.length === 0}
                    />
                </main>
            </div>
        </div>
    );
};

// Render the app
const rootElement = document.getElementById('root');
const root = createRoot(rootElement);
root.render(<App />);

