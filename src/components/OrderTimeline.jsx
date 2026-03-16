import React from 'react';
import { Check, Clock } from 'lucide-react';

const OrderTimeline = ({ status }) => {
  const steps = [
    { key: 'ordered', label: 'Ordered', color: 'primary' },
    { key: 'accepted', label: 'Accepted', color: 'accent' },
    { key: 'loaded', label: 'Loaded', color: 'accent' },
    { key: 'in_transit', label: 'In Transit', color: 'accent' },
    { key: 'delivered', label: 'Delivered', color: 'success' },
  ];

  const statusOrder = ['ordered', 'accepted', 'loaded', 'in_transit', 'delivered'];
  const currentIndex = statusOrder.indexOf(status);

  const getStatusColor = (stepIndex) => {
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="order-timeline">
      {steps.map((step, index) => {
        const stepStatus = getStatusColor(index);
        return (
          <div key={step.key} className={`timeline-step ${stepStatus}`}>
            <div className="timeline-icon">
              {stepStatus === 'completed' ? (
                <Check size={20} />
              ) : stepStatus === 'active' ? (
                <Clock size={20} />
              ) : (
                <div className="dot"></div>
              )}
            </div>
            <div className="timeline-label">{step.label}</div>
            {index < steps.length - 1 && (
              <div className={`timeline-connector ${stepStatus}`}></div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default OrderTimeline;
