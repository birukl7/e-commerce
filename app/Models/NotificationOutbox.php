<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NotificationOutbox extends Model
{
    use HasFactory;

    protected $table = 'notification_outbox';

    protected $fillable = [
        'key',
        'event_type',
        'model_type',
        'model_id',
        'recipient',
    ];
}


