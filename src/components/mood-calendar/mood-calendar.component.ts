import {
  Component,
  ChangeDetectionStrategy,
  input,
  signal,
  effect,
  viewChild,
  ElementRef,
  inject,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as d3 from 'd3';
import { JournalEntry, Mood } from '../../models/journal-entry.model';
import { ThemeService } from '../../services/theme.service';

interface CalendarDay {
  date: Date;
  entries: JournalEntry[];
}

@Component({
  selector: 'app-mood-calendar',
  imports: [CommonModule],
  templateUrl: './mood-calendar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoodCalendarComponent {
  entries = input.required<JournalEntry[]>();
  themeService = inject(ThemeService);

  currentDate = signal(new Date());
  calendarContainer = viewChild.required<ElementRef>('calendarContainer');
  
  selectedDayEntries = signal<JournalEntry[] | null>(null);
  popoverPosition = signal<{ top: number; left: number } | null>(null);

  isCurrentMonth = computed(() => {
    const today = new Date();
    const currentDate = this.currentDate();
    return today.getFullYear() === currentDate.getFullYear() &&
           today.getMonth() === currentDate.getMonth();
  });

  private themeColorMap: Record<string, string> = {
    blue: '#3B82F6',
    emerald: '#10B981',
    rose: '#F43F5E',
    cyan: '#06B6D4',
    violet: '#8B5CF6',
    slate: '#64748B',
  };
  
  private moodColors: Record<Mood, string> = {
    Happy: '#FBBF24', // amber-400
    Calm: '#34D399', // emerald-400
    Sad: '#60A5FA', // blue-400
    Energetic: '#F97316', // orange-500
    Neutral: '#9CA3AF', // gray-400
  };
  
  private moodEmojis: Record<Mood, string> = {
    'Happy': '😊',
    'Calm': '😌',
    'Neutral': '😐',
    'Energetic': '⚡️',
    'Sad': '😢'
  };

  constructor() {
    effect(() => this.drawCalendar(), { allowSignalWrites: true });
  }

  changeMonth(offset: number): void {
    this.currentDate.update(d => {
      const newDate = new Date(d);
      newDate.setMonth(newDate.getMonth() + offset);
      return newDate;
    });
  }

  goToToday(): void {
    this.currentDate.set(new Date());
  }

  closePopover(): void {
    this.selectedDayEntries.set(null);
    this.popoverPosition.set(null);
  }

  getMoodEmoji(mood: Mood): string {
    return this.moodEmojis[mood] || '😐';
  }

  private isSameDay(d1: Date, d2: Date): boolean {
    return d1.getUTCFullYear() === d2.getUTCFullYear() &&
           d1.getUTCMonth() === d2.getUTCMonth() &&
           d1.getUTCDate() === d2.getUTCDate();
  }

  private drawCalendar(): () => void {
    const entries = this.entries();
    const container = this.calendarContainer().nativeElement;
    const isDarkMode = this.themeService.isDarkMode();
    const primaryColor = this.themeColorMap[this.themeService.primaryColor()];
    
    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    const entriesByDate = new Map<string, JournalEntry[]>();
    entries.forEach(entry => {
      const dateKey = entry.date;
      if (!entriesByDate.has(dateKey)) {
        entriesByDate.set(dateKey, []);
      }
      entriesByDate.get(dateKey)!.push(entry);
    });

    const year = this.currentDate().getFullYear();
    const month = this.currentDate().getMonth();

    // --- Calendar Grid Calculation ---
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0=Sun, 1=Mon, ...
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const calendarDays: (CalendarDay | null)[] = []; // Allow nulls for empty days

    // Add padding days from previous month
    for (let i = 0; i < firstDayOfMonth; i++) {
        calendarDays.push(null);
    }

    // Add all days of the current month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(Date.UTC(year, month, i));
      const dateKey = date.toISOString().split('T')[0];
      const dayEntries = entriesByDate.get(dateKey) || [];
      calendarDays.push({ date, entries: dayEntries });
    }
    // --- End of Grid Calculation ---

    const width = container.clientWidth;
    const cellSize = (width / 7) - 4;
    const height = Math.ceil(calendarDays.length / 7) * (cellSize + 4);

    d3.select(container).selectAll('svg').remove();

    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`);

    const tooltip = d3.select('body').append('div')
      .attr('class', 'd3-tooltip')
      .style('position', 'absolute')
      .style('z-index', '10')
      .style('visibility', 'hidden')
      .style('padding', '8px')
      .style('background', 'rgba(0,0,0,0.8)')
      .style('border-radius', '4px')
      .style('color', '#fff')
      .style('font-size', '12px');

    const dayGroups = svg.selectAll('g')
      .data(calendarDays)
      .join('g')
      .attr('transform', (d, i) => `translate(${(i % 7) * (cellSize + 4)}, ${Math.floor(i / 7) * (cellSize + 4)})`);

    dayGroups.append('rect')
      .attr('width', cellSize)
      .attr('height', cellSize)
      .attr('rx', 4)
      .attr('ry', 4)
      .attr('fill', d => {
        if (!d) return 'transparent';
        if (d.entries.length > 0) {
          return this.moodColors[d.entries[0].mood];
        }
        return isDarkMode ? '#374151' : '#F3F4F6';
      })
      .attr('stroke', d => {
        if (!d) return 'transparent';
        if (this.isSameDay(d.date, today)) {
          return primaryColor;
        }
        return isDarkMode ? '#4B5563' : '#E5E7EB';
      })
      .attr('stroke-width', d => d && this.isSameDay(d.date, today) ? 2 : 1);

    dayGroups.append('text')
      .text(d => d ? d.date.getUTCDate().toString() : '')
      .attr('x', cellSize / 2)
      .attr('y', cellSize / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .attr('fill', d => {
        if (!d) return 'transparent';
        if (d.entries.length > 0) {
          return '#FFFFFF';
        }
        if (this.isSameDay(d.date, today)) {
            return primaryColor;
        }
        return isDarkMode ? '#D1D5DB' : '#374151';
      })
      .style('font-size', `${Math.max(10, cellSize * 0.25)}px`)
      .style('pointer-events', 'none')
      .style('font-weight', d => d && this.isSameDay(d.date, today) ? 'bold' : 'normal');

    dayGroups
      .filter(d => d && d.entries.length > 0)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        
        const popoverWidth = 240; // Tailwind w-60
        const popoverHeight = 180; // Estimate
        let left = event.pageX + 10;
        let top = event.pageY + 10;

        if (left + popoverWidth > window.innerWidth) {
          left = event.pageX - popoverWidth - 10;
        }
        if (top + popoverHeight > window.innerHeight) {
          top = event.pageY - popoverHeight - 10;
        }

        this.selectedDayEntries.set(d!.entries);
        this.popoverPosition.set({ top, left });
      })
      .on('mouseover', function(event, d) {
        d3.select(this).select('rect').style('transform', 'scale(1.05)').style('transition', 'transform 0.2s');
        const count = d!.entries.length;
        const entryText = count > 1 ? 'entries' : 'entry';
        tooltip.html(`<strong>${count} ${entryText}</strong>`).style('visibility', 'visible');
      })
      .on('mousemove', function(event) {
        tooltip.style('top', (event.pageY - 10) + 'px').style('left', (event.pageX + 10) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this).select('rect').style('transform', 'scale(1)');
        tooltip.style('visibility', 'hidden');
      });
      
    return () => { tooltip.remove(); };
  }
}